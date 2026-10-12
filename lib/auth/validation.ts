/**
 * Hand-rolled validation for the account forms. The project deliberately
 * carries no schema library, and these are the only two forms that need it —
 * a dependency would cost more than the ~80 lines below.
 *
 * The server action is the authoritative check; the browser only gets
 * `required` attributes for immediate feedback. Every message is the Swedish
 * text shown under the field.
 */

export type RegisterField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "password"
  | "passwordConfirm"
  | "consent";

export type FieldErrors<Field extends string> = Partial<
  Record<Field, string>
>;

/** Shape returned by the register/login actions and read by useActionState. */
export interface FormState<Field extends string> {
  errors?: FieldErrors<Field>;
  /** Form-level problem, e.g. wrong credentials or a database failure. */
  message?: string;
  /** Echoed back so a rejected submit doesn't wipe what was typed. */
  values?: Record<string, string>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Digits, spaces, dashes, parens and an optional leading +. */
const PHONE_PATTERN = /^\+?[\d\s\-()]{6,20}$/;

export const PASSWORD_MIN_LENGTH = 8;
/** Guards against absurd inputs; scrypt runs on whatever it's given. */
const PASSWORD_MAX_LENGTH = 200;
const NAME_MAX_LENGTH = 80;
/** The longest address an SMTP implementation must accept (RFC 5321). */
const EMAIL_MAX_LENGTH = 254;

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  password: string;
}

export function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Validates the registration form. Returns either the cleaned values ready
 * for insertion or the per-field errors to render.
 */
export function validateRegistration(
  formData: FormData
):
  | { ok: true; data: RegisterInput }
  | { ok: false; errors: FieldErrors<RegisterField> } {
  const firstName = text(formData, "firstName");
  const lastName = text(formData, "lastName");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone");
  const street = text(formData, "street");
  const postalCode = text(formData, "postalCode");
  const city = text(formData, "city");
  // Not trimmed: a leading or trailing space is a legitimate password
  // character, and silently stripping it locks people out later.
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const consent = formData.get("consent") != null;

  const errors: FieldErrors<RegisterField> = {};

  if (!firstName) {
    errors.firstName = "Ange ditt förnamn.";
  } else if (firstName.length > NAME_MAX_LENGTH) {
    errors.firstName = `Förnamnet får vara högst ${NAME_MAX_LENGTH} tecken.`;
  }

  if (!lastName) {
    errors.lastName = "Ange ditt efternamn.";
  } else if (lastName.length > NAME_MAX_LENGTH) {
    errors.lastName = `Efternamnet får vara högst ${NAME_MAX_LENGTH} tecken.`;
  }

  if (!email) {
    errors.email = "Ange din e-postadress.";
  } else if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.email = "Ange en giltig e-postadress.";
  }

  if (!phone) {
    errors.phone = "Ange ditt telefonnummer.";
  } else if (
    !PHONE_PATTERN.test(phone) ||
    // The pattern alone would accept punctuation-only input like "- - - -".
    (phone.match(/\d/g)?.length ?? 0) < 6
  ) {
    errors.phone = "Ange ett giltigt telefonnummer.";
  }

  if (!password) {
    errors.password = "Välj ett lösenord.";
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Lösenordet måste innehålla minst ${PASSWORD_MIN_LENGTH} tecken.`;
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Lösenordet får vara högst ${PASSWORD_MAX_LENGTH} tecken.`;
    // \p{L} rather than a Latin range: a password is not less valid for
    // being written in Greek or Cyrillic.
  } else if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    errors.password = "Lösenordet måste innehålla både bokstäver och siffror.";
  }

  if (!passwordConfirm) {
    errors.passwordConfirm = "Upprepa lösenordet.";
  } else if (password !== passwordConfirm) {
    errors.passwordConfirm = "Lösenorden matchar inte.";
  }

  if (!consent) {
    errors.consent = "Du behöver godkänna hur vi behandlar dina uppgifter.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { firstName, lastName, email, phone, street, postalCode, city, password },
  };
}

// --- Administrator invites --------------------------------------------------

export type AdminInviteField = "email" | "password" | "passwordConfirm";

export interface AdminInviteInput {
  email: string;
  password: string;
}

/**
 * Validates the "bjud in administratör" form. Same password rules as a
 * visitor account — an administrator's password protects strictly more than
 * a bostadssökande's, so it has no business being weaker.
 */
export function validateAdminInvite(
  formData: FormData
):
  | { ok: true; data: AdminInviteInput }
  | { ok: false; errors: FieldErrors<AdminInviteField> } {
  const email = text(formData, "email").toLowerCase();
  // Not trimmed — a leading or trailing space is a legitimate character.
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const errors: FieldErrors<AdminInviteField> = {};

  if (!email) {
    errors.email = "Ange en e-postadress.";
  } else if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.email = "Ange en giltig e-postadress.";
  }

  if (!password) {
    errors.password = "Välj ett lösenord.";
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Lösenordet måste innehålla minst ${PASSWORD_MIN_LENGTH} tecken.`;
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Lösenordet får vara högst ${PASSWORD_MAX_LENGTH} tecken.`;
  } else if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    errors.password = "Lösenordet måste innehålla både bokstäver och siffror.";
  }

  if (!passwordConfirm) {
    errors.passwordConfirm = "Upprepa lösenordet.";
  } else if (password !== passwordConfirm) {
    errors.passwordConfirm = "Lösenorden matchar inte.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, data: { email, password } };
}
