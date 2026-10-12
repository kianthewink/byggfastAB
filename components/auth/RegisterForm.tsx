"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { register } from "@/lib/auth/user-actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/validation";

const fieldBase =
  "w-full rounded-md border bg-white px-3 py-2 text-sm text-ink transition-colors outline-none placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20";

interface FieldProps {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  children?: ReactNode;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

/** One labelled input with its error/hint line, wired up for screen readers. */
function Field({
  name,
  label,
  error,
  hint,
  children,
  className = "",
  required,
  ...input
}: FieldProps) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm text-ink">
        {label}
        {!required && <span className="ml-1.5 text-xs text-muted">(valfritt)</span>}
      </label>
      {children ?? (
        <input
          id={name}
          name={name}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`mt-1.5 ${fieldBase} ${
            error ? "border-red-500" : "border-line"
          }`}
          {...input}
        />
      )}
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${name}-hint`} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/**
 * Registration for the housing queue. Validation lives server-side in
 * lib/auth/validation.ts and comes back through useActionState, so the rules
 * can't be bypassed by editing the DOM; `required` here is only for instant
 * feedback. A successful submit signs the new account straight in and the
 * action redirects to Mina sidor.
 */
export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const errors = state?.errors;
  const values = state?.values;

  return (
    <div className="rounded-md border border-line bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl text-brand">Skapa konto</h2>
      <p className="mt-1 text-sm text-muted">
        Registrera dig som bostadssökande – kostnadsfritt, och din kötid börjar
        räknas direkt.
      </p>

      {state?.message && (
        <p
          role="alert"
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="firstName"
            label="Förnamn"
            required
            autoComplete="given-name"
            defaultValue={values?.firstName}
            error={errors?.firstName}
          />
          <Field
            name="lastName"
            label="Efternamn"
            required
            autoComplete="family-name"
            defaultValue={values?.lastName}
            error={errors?.lastName}
          />
        </div>

        <Field
          name="email"
          label="E-postadress"
          type="email"
          inputMode="email"
          required
          autoComplete="email"
          placeholder="namn@exempel.se"
          defaultValue={values?.email}
          error={errors?.email}
          hint="Du loggar in med din e-postadress."
        />

        <Field
          name="phone"
          label="Telefonnummer"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          placeholder="070-123 45 67"
          defaultValue={values?.phone}
          error={errors?.phone}
          hint="Vi ringer dig om dina intresseanmälningar och offerter."
        />

        <fieldset className="space-y-5 rounded-md border border-line bg-surface-3/60 p-5">
          <legend className="px-1 text-xs tracking-wide text-muted label-caps">
            Nuvarande adress
          </legend>

          <Field
            name="street"
            label="Gatuadress"
            autoComplete="street-address"
            defaultValue={values?.street}
          />

          <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
            <Field
              name="postalCode"
              label="Postnummer"
              inputMode="numeric"
              autoComplete="postal-code"
              defaultValue={values?.postalCode}
            />
            <Field
              name="city"
              label="Ort"
              autoComplete="address-level2"
              defaultValue={values?.city}
            />
          </div>
        </fieldset>

        <Field
          name="password"
          label="Lösenord"
          required
          error={errors?.password}
          hint={`Minst ${PASSWORD_MIN_LENGTH} tecken, med både bokstäver och siffror.`}
        >
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              aria-invalid={!!errors?.password}
              aria-describedby={
                errors?.password ? "password-error" : "password-hint"
              }
              className={`${fieldBase} pr-11 ${
                errors?.password ? "border-red-500" : "border-line"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Dölj lösenord" : "Visa lösenord"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition-colors hover:text-brand"
            >
              <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
            </button>
          </div>
        </Field>

        <Field
          name="passwordConfirm"
          label="Upprepa lösenord"
          type="password"
          required
          autoComplete="new-password"
          error={errors?.passwordConfirm}
        />

        <div>
          <label className="flex items-start gap-2.5 text-sm leading-relaxed text-ink">
            <input
              type="checkbox"
              name="consent"
              value="yes"
              required
              defaultChecked={values?.consent === "yes"}
              aria-invalid={!!errors?.consent}
              aria-describedby={errors?.consent ? "consent-error" : undefined}
              className="mt-0.5 size-4 shrink-0 rounded border-line accent-brand"
            />
            <span>
              Jag godkänner att BOFAST behandlar mina personuppgifter för att
              administrera min plats i bostadskön.
            </span>
          </label>
          {errors?.consent && (
            <p id="consent-error" className="mt-1.5 text-xs text-red-600">
              {errors.consent}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-6 py-2.5 text-sm text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="check" size={16} />
          {pending ? "Skapar konto…" : "Skapa konto"}
        </button>
      </form>

      <p className="mt-6 border-t border-line pt-5 text-sm text-muted">
        Har du redan ett konto?{" "}
        <Link
          href="/mina-sidor"
          className="text-brand underline-offset-2 hover:underline"
        >
          Logga in här
        </Link>
        .
      </p>
    </div>
  );
}
