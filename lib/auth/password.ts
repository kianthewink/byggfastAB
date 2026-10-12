import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

/**
 * Password hashing on Node's built-in scrypt — a real password KDF, no extra
 * dependency. Parameters are stored inside the digest so raising the cost
 * later doesn't invalidate existing hashes: verify reads N/r/p back out of
 * whatever it's handed.
 *
 * N=16384, r=8, p=1 are the interactive-login parameters from the scrypt
 * paper and cost roughly 16 MB and ~50–100 ms per hash.
 */
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
/** Node's default maxmem is 32 MB; 128 * N * r is 16 MB, so leave headroom. */
const MAX_MEM = 64 * 1024 * 1024;

/**
 * Unicode-normalise so a password typed with composed vs decomposed accents
 * (å as one code point vs a + ring) verifies the same way on every platform.
 */
function normalize(password: string): string {
  return password.normalize("NFKC");
}

/** Returns `scrypt$N$r$p$salt$hash`, all binary parts base64. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scryptAsync(normalize(password), salt, KEY_LENGTH, {
    N,
    r: R,
    p: P,
    maxmem: MAX_MEM,
  });

  return [
    "scrypt",
    N,
    R,
    P,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
}

/**
 * Constant-time check of a password against a stored digest. Returns false
 * for malformed digests rather than throwing, so a corrupt row reads as a
 * failed login instead of a 500.
 */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, rawN, rawR, rawP, rawSalt, rawHash] = parts;
  const costN = Number(rawN);
  const costR = Number(rawR);
  const costP = Number(rawP);
  if (!Number.isInteger(costN) || !Number.isInteger(costR) || !Number.isInteger(costP)) {
    return false;
  }

  const salt = Buffer.from(rawSalt, "base64");
  const expected = Buffer.from(rawHash, "base64");
  // We derive to expected.length below, so a digest that had been truncated
  // to a byte or two would compare only those bytes. Refuse anything shorter
  // than the shortest digest this module has ever written.
  if (salt.length < SALT_LENGTH || expected.length < KEY_LENGTH) return false;

  let derived: Buffer;
  try {
    derived = await scryptAsync(normalize(password), salt, expected.length, {
      N: costN,
      r: costR,
      p: costP,
      maxmem: MAX_MEM,
    });
  } catch {
    // Out-of-range cost parameters make scrypt throw.
    return false;
  }

  // Lengths always match here (we derived to expected.length), so
  // timingSafeEqual can't throw on a length mismatch.
  return timingSafeEqual(derived, expected);
}
