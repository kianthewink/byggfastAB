"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { login } from "@/lib/auth/user-actions";
import { site } from "@/data/site";

type Role = "hyresgast" | "sokande";

interface RoleOption {
  id: Role;
  label: string;
  identifierLabel: string;
  identifierHint: string;
  placeholder: string;
}

const roles: RoleOption[] = [
  {
    id: "hyresgast",
    label: "Hyresgäst",
    identifierLabel: "Kundnummer eller e-postadress",
    identifierHint: "Kundnumret står överst till höger på din hyresavi.",
    placeholder: "10023 eller namn@exempel.se",
  },
  {
    id: "sokande",
    label: "Bostadssökande",
    identifierLabel: "E-postadress",
    identifierHint: "Använd samma e-postadress som när du ställde dig i kön.",
    placeholder: "namn@exempel.se",
  },
];

const fieldBase =
  "w-full rounded-md border bg-white px-3 py-2 text-sm text-ink transition-colors outline-none placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20";

/**
 * Login for "Mina sidor", backed by the `login` Server Action.
 *
 * The role tabs only change the wording of the identifier field — both kinds
 * of account live in the same `users` table, and the action accepts either an
 * e-mail address or a kundnummer. Registration (bostadssökande) never sets a
 * kundnummer; the office fills that in when someone becomes a tenant.
 */
export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [role, setRole] = useState<Role>("hyresgast");
  const [showPassword, setShowPassword] = useState(false);
  const [bankIdNotice, setBankIdNotice] = useState(false);
  const [state, formAction, pending] = useActionState(login, undefined);

  const activeRole = roles.find((r) => r.id === role) ?? roles[0];
  const identifierError = state?.errors?.identifier;
  const passwordError = state?.errors?.password;

  return (
    <div className="rounded-md border border-line bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl text-brand">Logga in</h2>
      <p className="mt-1 text-sm text-muted">
        Välj om du är hyresgäst hos oss eller står i vår bostadskö.
      </p>

      {/* Roll-väljare */}
      <div
        className="mt-6 grid grid-cols-2 gap-1 rounded-md bg-surface-3 p-1"
        role="group"
        aria-label="Välj typ av konto"
      >
        {roles.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={role === option.id}
            onClick={() => setRole(option.id)}
            className={`rounded-md px-3 py-2 text-xs tracking-wide transition-colors label-caps ${
              role === option.id
                ? "bg-white text-brand shadow-sm"
                : "text-muted hover:text-brand"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {state?.message && (
        <p
          role="alert"
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-5">
        {redirectTo && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}

        {/* Kundnummer / e-post */}
        <div>
          <label htmlFor="identifier" className="block text-sm text-ink">
            {activeRole.identifierLabel}
          </label>
          <input
            id="identifier"
            name="identifier"
            type={role === "sokande" ? "email" : "text"}
            inputMode={role === "sokande" ? "email" : "text"}
            autoComplete="username"
            required
            defaultValue={state?.values?.identifier}
            placeholder={activeRole.placeholder}
            aria-invalid={!!identifierError}
            aria-describedby={
              identifierError ? "identifier-error" : "identifier-hint"
            }
            className={`mt-1.5 ${fieldBase} ${
              identifierError ? "border-red-500" : "border-line"
            }`}
          />
          {identifierError ? (
            <p id="identifier-error" className="mt-1.5 text-xs text-red-600">
              {identifierError}
            </p>
          ) : (
            <p id="identifier-hint" className="mt-1.5 text-xs text-muted">
              {activeRole.identifierHint}
            </p>
          )}
        </div>

        {/* Lösenord */}
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="password" className="block text-sm text-ink">
              Lösenord
            </label>
            <Link
              href="/mina-sidor/glomt-losenord"
              className="text-xs text-brand underline-offset-2 hover:underline"
            >
              Glömt lösenordet?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
              className={`${fieldBase} pr-11 ${
                passwordError ? "border-red-500" : "border-line"
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
          {passwordError && (
            <p id="password-error" className="mt-1.5 text-xs text-red-600">
              {passwordError}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="remember"
            className="size-4 rounded border-line accent-brand"
          />
          Håll mig inloggad
        </label>

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-6 py-2.5 text-sm text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="lock" size={16} />
          {pending ? "Loggar in…" : "Logga in"}
        </button>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />
          eller
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={() => setBankIdNotice(true)}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-brand px-6 py-2.5 text-sm text-brand transition-colors hover:bg-surface-2"
        >
          <Icon name="shield" size={16} />
          Logga in med Mobilt BankID
        </button>
      </form>

      {bankIdNotice && (
        <p
          role="status"
          className="mt-5 rounded-md border border-line bg-surface-3 px-4 py-3 text-sm leading-relaxed text-ink"
        >
          BankID är inte kopplat ännu – logga in med e-post och lösenord så
          länge. Behöver du hjälp är du välkommen att ringa oss på{" "}
          <a
            href={`tel:${site.address.phone.replace(/[\s-]/g, "")}`}
            className="text-brand underline-offset-2 hover:underline"
          >
            {site.address.phone}
          </a>
          .
        </p>
      )}

      {/* Registrering – egen ruta med tydlig knapp. Tidigare låg det som en
          textlänk längst ned och var lätt att missa för nya besökare. */}
      <div className="mt-6 rounded-md border border-brand/25 bg-surface-3 p-5">
        <h3 className="text-base text-brand">Har du inget konto?</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink">
          Registrera dig som bostadssökande för att ställa dig i vår bostadskö.
          Det är kostnadsfritt och tar bara någon minut.
        </p>
        <Link
          href="/mina-sidor/registrera"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-brand bg-white px-6 py-2.5 text-sm text-brand transition-colors hover:bg-brand hover:text-white"
        >
          <Icon name="user" size={16} />
          Registrera dig som bostadssökande
        </Link>
      </div>
    </div>
  );
}
