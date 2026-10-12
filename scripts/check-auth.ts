import { config } from "dotenv";
import Module from "module";
import path from "path";

config({ path: ".env.local" });

// lib/auth/* is server-only code; outside Next there is no "react-server"
// export condition, so the real package would throw on import.
const stub = path.join(__dirname, "_server-only-stub.cjs");
const resolveFilename = (
  Module as unknown as { _resolveFilename: (...args: unknown[]) => string }
)._resolveFilename;
(
  Module as unknown as { _resolveFilename: (...args: unknown[]) => string }
)._resolveFilename = function (request: unknown, ...rest: unknown[]) {
  if (request === "server-only") return stub;
  return resolveFilename.call(this, request, ...rest);
};

/** Ad-hoc checks for the two session kinds and the password hasher. */
async function main() {
  const {
    signSessionToken,
    verifySessionToken,
    signUserToken,
    verifyUserToken,
  } = await import("../lib/auth/token");
  const { hashPassword, verifyPassword } = await import("../lib/auth/password");
  const { SignJWT } = await import("jose");

  const results: [string, boolean][] = [];
  const check = (name: string, pass: boolean) => results.push([name, pass]);

  const adminToken = await signSessionToken("admin@example.com");
  const userToken = await signUserToken("user-123", 3600);

  check(
    "admin token verifies as admin",
    (await verifySessionToken(adminToken))?.email === "admin@example.com"
  );
  check(
    "user token verifies as user",
    (await verifyUserToken(userToken))?.userId === "user-123"
  );

  // The escalation that matters: both are signed with the same AUTH_SECRET,
  // so only the `typ` claim keeps a visitor out of the admin panel.
  check(
    "user token REJECTED by the admin verifier",
    (await verifySessionToken(userToken)) === null
  );
  check(
    "admin token REJECTED by the user verifier",
    (await verifyUserToken(adminToken)) === null
  );

  // A forged token carrying an admin-looking payload but no typ claim.
  const key = new TextEncoder().encode(process.env.AUTH_SECRET);
  const forged = await new SignJWT({ email: "admin@example.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
  check(
    "token without typ REJECTED by the admin verifier",
    (await verifySessionToken(forged)) === null
  );

  const forgedUser = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("user-123")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
  check(
    "token without typ REJECTED by the user verifier",
    (await verifyUserToken(forgedUser)) === null
  );

  check("garbage token rejected", (await verifyUserToken("nonsense")) === null);

  // Password hashing.
  const hash = await hashPassword("Bofast2026");
  check("hash is not the plaintext", !hash.includes("Bofast2026"));
  check("correct password verifies", await verifyPassword("Bofast2026", hash));
  check(
    "wrong password rejected",
    !(await verifyPassword("Bofast2027", hash))
  );
  check(
    "two hashes of the same password differ (salted)",
    (await hashPassword("Bofast2026")) !== hash
  );
  check(
    "malformed digest rejected without throwing",
    !(await verifyPassword("Bofast2026", "not-a-digest"))
  );
  check(
    "empty digest rejected without throwing",
    !(await verifyPassword("Bofast2026", ""))
  );

  // Duplicate-registration detection. drizzle-orm hides the SQLSTATE code
  // behind DrizzleQueryError.cause, so the shape below mirrors what a real
  // duplicate insert throws — verified against Neon in a live probe.
  const { isUniqueViolation } = await import("../lib/db/errors");
  check(
    "unique violation found through drizzle's cause wrapper",
    isUniqueViolation(
      Object.assign(new Error("Failed query"), { cause: { code: "23505" } })
    )
  );
  check(
    "unique violation found when the code is top level",
    isUniqueViolation(Object.assign(new Error("x"), { code: "23505" }))
  );
  check(
    "unrelated error is not a unique violation",
    !isUniqueViolation(new Error("boom"))
  );
  const selfReferencing: { cause?: unknown } = {};
  selfReferencing.cause = selfReferencing;
  check(
    "self-referencing cause chain terminates",
    !isUniqueViolation(selfReferencing)
  );

  // Redirect targets. The backslash and tab cases are the ones a
  // "starts with / but not //" check waves through.
  const { safeRedirectPath } = await import("../lib/auth/redirects");
  const BS = String.fromCharCode(92);
  const FALLBACK = "/mina-sidor";

  for (const allowed of [
    "/attefallshus-med-kallare",
    "/attefallshus/hyltebruk-bruksgatan-2a",
    "/mina-sidor/sparade?a=1#x",
  ]) {
    check(
      `same-origin path allowed: ${allowed}`,
      safeRedirectPath(allowed, FALLBACK) === allowed
    );
  }

  for (const hostile of [
    "//evil.com",
    "https://evil.com",
    "http://evil.com",
    `/${BS}evil.com`,
    `/${BS}/evil.com`,
    `${BS}${BS}evil.com`,
    "/\t/evil.com",
    "/\n/evil.com",
    "/\r/evil.com",
    "javascript:alert(1)",
    "",
  ]) {
    check(
      `hostile target rejected: ${JSON.stringify(hostile)}`,
      safeRedirectPath(hostile, FALLBACK) === FALLBACK
    );
  }

  check(
    "repeated ?next= (array) rejected instead of throwing",
    safeRedirectPath(["/a", "/b"], FALLBACK) === FALLBACK
  );
  check(
    "undefined target falls back",
    safeRedirectPath(undefined, FALLBACK) === FALLBACK
  );

  // Validation rules the review probed.
  const { validateRegistration } = await import("../lib/auth/validation");
  const form = (over: Record<string, string>) => {
    const fd = new FormData();
    const base: Record<string, string> = {
      firstName: "Test",
      lastName: "Testsson",
      email: "a@b.se",
      phone: "070-123 45 67",
      password: "Bofast2026",
      passwordConfirm: "Bofast2026",
      consent: "yes",
      ...over,
    };
    for (const [k, v] of Object.entries(base)) if (v !== "") fd.set(k, v);
    return fd;
  };

  check("valid registration accepted", validateRegistration(form({})).ok);
  check(
    "punctuation-only phone rejected",
    !validateRegistration(form({ phone: "- - - -" })).ok
  );
  check(
    "+46 phone accepted",
    validateRegistration(form({ phone: "+46 70 123 45 67" })).ok
  );
  check(
    "non-latin password with a digit accepted",
    validateRegistration(
      form({ password: "Пароль2026", passwordConfirm: "Пароль2026" })
    ).ok
  );
  check(
    "digits-only password rejected",
    !validateRegistration(
      form({ password: "12345678", passwordConfirm: "12345678" })
    ).ok
  );
  check(
    "missing consent rejected",
    !validateRegistration(form({ consent: "" })).ok
  );
  check(
    "name with an apostrophe accepted",
    validateRegistration(form({ lastName: "O'Brien-Åkesson" })).ok
  );
  check(
    "password keeps a trailing space (not trimmed away)",
    validateRegistration(form({ password: "Bofast26 ", passwordConfirm: "Bofast26 " }))
      .ok
  );

  let failures = 0;
  for (const [name, pass] of results) {
    if (!pass) failures++;
    console.log(`${pass ? "PASS" : "FAIL"}  ${name}`);
  }
  console.log(`\n${results.length - failures}/${results.length} passed`);
  if (failures > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
