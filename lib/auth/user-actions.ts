"use server";

import { randomBytes, randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { isUniqueViolation } from "@/lib/db/errors";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { safeRedirectPath } from "./redirects";
import { createUserSession, destroyUserSession } from "./user-session";
import {
  type FormState,
  type RegisterField,
  text,
  validateRegistration,
} from "./validation";

export type RegisterState = FormState<RegisterField>;
export type LoginField = "identifier" | "password";
export type LoginState = FormState<LoginField>;

/**
 * A real scrypt digest of a value nobody can supply. Login verifies against
 * this when no account matches, so a wrong e-mail costs the same ~80 ms as a
 * wrong password — otherwise response time alone reveals which addresses are
 * registered. Derived once per process, lazily, rather than hard-coded, so
 * it always parses as a valid digest.
 */
let dummyHash: Promise<string> | undefined;

function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(32).toString("hex"));
  return dummyHash;
}

/** Creates an account for a bostadssökande and signs them straight in. */
export async function register(
  _prevState: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  const result = validateRegistration(formData);

  // Everything except the passwords is echoed back so a rejected submit
  // doesn't make the visitor retype the whole form. React resets uncontrolled
  // fields once the action settles, so anything missing here — the consent
  // box included — comes back blank.
  const values = {
    firstName: text(formData, "firstName"),
    lastName: text(formData, "lastName"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    street: text(formData, "street"),
    postalCode: text(formData, "postalCode"),
    city: text(formData, "city"),
    consent: formData.get("consent") != null ? "yes" : "",
  };

  if (!result.ok) {
    return { errors: result.errors, values };
  }

  const { email, password, ...profile } = result.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return {
      errors: { email: "Det finns redan ett konto med den e-postadressen." },
      values,
    };
  }

  const id = randomUUID();

  try {
    await db.insert(users).values({
      id,
      email,
      passwordHash: await hashPassword(password),
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      street: profile.street || null,
      postalCode: profile.postalCode || null,
      city: profile.city || null,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        errors: { email: "Det finns redan ett konto med den e-postadressen." },
        values,
      };
    }
    // Deliberately not logging the error object: drizzle attaches the failed
    // query's parameters to it, which here means the password digest and the
    // applicant's name, phone and address.
    console.error(
      "Registration insert failed:",
      error instanceof Error ? error.name : "unknown error"
    );
    return {
      message: "Något gick fel när kontot skulle skapas. Försök igen.",
      values,
    };
  }

  await createUserSession(id, true);

  // Outside the try/catch on purpose — redirect() signals by throwing.
  redirect("/mina-sidor");
}

/**
 * Signs in an existing account. The identifier is an e-mail address, or a
 * kundnummer for tenants the office has issued one to.
 */
export async function login(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const identifier = text(formData, "identifier");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") != null;
  const target = safeRedirectPath(text(formData, "redirectTo"), "/mina-sidor");

  const errors: LoginState["errors"] = {};
  if (!identifier) errors.identifier = "Ange e-postadress eller kundnummer.";
  if (!password) errors.password = "Ange ditt lösenord.";
  if (Object.keys(errors).length > 0) {
    return { errors, values: { identifier } };
  }

  const isEmail = identifier.includes("@");
  const [account] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(
      isEmail
        ? eq(users.email, identifier.toLowerCase())
        : eq(users.customerNumber, identifier)
    )
    .limit(1);

  const passwordOk = await verifyPassword(
    password,
    account?.passwordHash ?? (await getDummyHash())
  );

  if (!account || !passwordOk) {
    return {
      message: isEmail
        ? "Fel e-postadress eller lösenord."
        : "Fel kundnummer eller lösenord.",
      values: { identifier },
    };
  }

  await createUserSession(account.id, remember);

  redirect(target);
}

export async function logout() {
  await destroyUserSession();
  redirect("/mina-sidor");
}
