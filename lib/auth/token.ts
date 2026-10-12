import "server-only";
import { SignJWT, jwtVerify } from "jose";

/**
 * Two completely separate populations sign in to this app:
 *
 *   - the single admin (env-var credentials, full CMS write access)
 *   - site visitors with an account (rows in the `users` table)
 *
 * They get different cookies AND a different `typ` claim. The cookie split
 * alone isn't enough: both tokens are signed with the same AUTH_SECRET, so
 * without `typ` a visitor could paste their own token into the admin cookie
 * and the admin verifier would happily accept it. Each verifier therefore
 * rejects anything that isn't its own kind.
 */
export const SESSION_COOKIE = "session";
export const USER_SESSION_COOKIE = "bofast_session";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_SECONDS;

/** "Håll mig inloggad" — otherwise a visitor session lasts a day. */
export const USER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day
export const USER_SESSION_REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Copy .env.example to .env.local and fill it in."
    );
  }
  return new TextEncoder().encode(secret);
}

// --- Admin session ----------------------------------------------------------

export async function signSessionToken(email: string): Promise<string> {
  return new SignJWT({ email, typ: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    if (payload.typ !== "admin") return null;
    return typeof payload.email === "string" ? { email: payload.email } : null;
  } catch {
    return null;
  }
}

// --- Visitor session --------------------------------------------------------

export interface UserSession {
  userId: string;
}

export async function signUserToken(
  userId: string,
  maxAgeSeconds: number
): Promise<string> {
  // Only the user id goes in the token. Name, e-mail and address are read
  // from the database per request so a stale cookie can never resurrect
  // details the user has since changed.
  return new SignJWT({ typ: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSecretKey());
}

export async function verifyUserToken(
  token: string
): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    if (payload.typ !== "user") return null;
    return typeof payload.sub === "string" && payload.sub.length > 0
      ? { userId: payload.sub }
      : null;
  } catch {
    return null;
  }
}
