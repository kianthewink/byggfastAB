"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  LockIcon,
  LogOutIcon,
  ShieldIcon,
  TrashIcon,
  UserPlusIcon,
} from "@/components/admin/icons";
import { logout } from "@/lib/auth/actions";
import {
  type AdminPageData,
  type InviteState,
  changePinAction,
  checkPinAction,
  getAdminPageData,
  inviteAdminAction,
  revokeAdminAction,
} from "@/lib/auth/admin-actions";
import { PIN_LENGTH } from "@/lib/auth/pin-format";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus:border-accent";
const labelClass = "flex flex-col gap-1 text-xs font-medium text-panel-muted";

const dateFormat = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

/**
 * "Administratörer" — the PIN-gated page for inviting extra admins.
 *
 * Unlocking here only reveals the form. The PIN is submitted again with
 * every mutation and re-verified on the server, because a Server Action is a
 * public endpoint and a client that skipped this gate could otherwise call
 * the invite action directly.
 */
export function AdminsBoard({
  initialData,
  maxAdmins,
}: {
  initialData: AdminPageData;
  maxAdmins: number;
}) {
  const [data, setData] = useState(initialData);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [showPinChange, setShowPinChange] = useState(false);
  const [nextPin, setNextPin] = useState("");
  const [pinNotice, setPinNotice] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(
    inviteAdminAction,
    undefined as InviteState | undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  // A successful invite has to be reflected in the list, which the action
  // can't do on its own — it returns form state, not page data.
  useEffect(() => {
    if (!state?.createdEmail) return;
    formRef.current?.reset();
    getAdminPageData().then(setData).catch(() => {});
  }, [state?.createdEmail]);

  const refresh = async () => {
    try {
      setData(await getAdminPageData());
    } catch {
      /* The list simply stays as it was. */
    }
  };

  const handleUnlock = async () => {
    setGateError(null);
    setIsChecking(true);
    try {
      const result = await checkPinAction(pin);
      if (result.status === "ok") {
        setUnlocked(true);
      } else {
        setGateError(result.message);
        setUnlocked(false);
      }
    } catch {
      setGateError("Kunde inte kontrollera PIN-koden. Försök igen.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setListError(null);
    setRevokingId(id);
    try {
      const result = await revokeAdminAction(id, pin);
      if (result.ok) {
        setConfirmingId(null);
        await refresh();
      } else {
        setListError(result.message);
      }
    } finally {
      setRevokingId(null);
    }
  };

  const handleChangePin = async () => {
    setPinNotice(null);
    const result = await changePinAction(pin, nextPin);
    if (result.ok) {
      setPin(nextPin);
      setNextPin("");
      setShowPinChange(false);
      setPinNotice("PIN-koden är ändrad.");
    } else {
      setPinNotice(result.message);
    }
  };

  const isFull = data.remaining === 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col gap-1 px-8 py-8">
        <h1 className="text-2xl font-semibold">Administratörer</h1>
        <p className="max-w-2xl text-sm text-panel-muted">
          Här kan du bjuda in upp till {maxAdmins} extra administratörer som
          loggar in med egen e-postadress och eget lösenord. Det krävs en
          sexsiffrig PIN-kod för att lägga till eller ta bort någon.
        </p>
      </header>

      <main className="flex max-w-3xl flex-col gap-6 px-8 pb-12">
        {/* Logga ut den administratör som är inloggad just nu. En egen
            åtgärd här, skild från kontolistan nedan — att ta bort ett konto
            och att logga ut den man själv är inloggad som är olika saker. */}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-panel p-4 text-panel-foreground">
          <p className="text-sm text-panel-muted">
            Inloggad som{" "}
            <span className="font-medium text-foreground">
              {data.currentEmail}
            </span>
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-panel-muted transition-colors hover:bg-card hover:text-foreground"
            >
              <LogOutIcon className="h-4 w-4" />
              Logga ut
            </button>
          </form>
        </section>

        {/* Nuvarande administratörer */}
        <section className="rounded-xl border border-border bg-panel p-5 text-panel-foreground">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Nuvarande administratörer</h2>
            <span className="text-xs text-panel-muted">
              {data.admins.length} av {maxAdmins} inbjudna platser använda
            </span>
          </div>

          <ul className="divide-y divide-border">
            {data.rootEmail && (
              <li className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <ShieldIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {data.rootEmail}
                      {data.currentEmail === data.rootEmail && (
                        <span className="ml-2 text-xs font-normal text-panel-muted">
                          (du)
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-panel-muted">
                      Huvudadministratör · inloggningen från .env.local
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-card px-2.5 py-0.5 text-[11px] font-medium text-panel-muted">
                  Kan inte tas bort
                </span>
              </li>
            )}

            {data.admins.map((admin) => (
              <li
                key={admin.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card text-panel-muted">
                    <UserPlusIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {admin.email}
                      {data.currentEmail === admin.email && (
                        <span className="ml-2 text-xs font-normal text-panel-muted">
                          (du)
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-panel-muted">
                      Inbjuden av {admin.invitedBy} ·{" "}
                      {dateFormat.format(admin.createdAt)}
                    </p>
                  </div>
                </div>

                {!unlocked ? (
                  <span className="shrink-0 text-xs text-panel-muted">
                    Lås upp med PIN för att ta bort
                  </span>
                ) : confirmingId === admin.id ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-rose-600">Ta bort?</span>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      disabled={revokingId === admin.id}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-card disabled:opacity-50"
                    >
                      Avbryt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevoke(admin.id)}
                      disabled={revokingId === admin.id}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {revokingId === admin.id ? "Tar bort…" : "Ta bort"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(admin.id)}
                    className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-rose-600 transition-opacity hover:opacity-80"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Ta bort
                  </button>
                )}
              </li>
            ))}

            {data.admins.length === 0 && (
              <li className="py-3 text-sm text-panel-muted">
                Inga extra administratörer är inbjudna ännu.
              </li>
            )}
          </ul>

          {listError && (
            <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
              {listError}
            </p>
          )}
        </section>

        {/* PIN-lås */}
        {!unlocked ? (
          <section className="rounded-xl border border-border bg-panel p-5 text-panel-foreground">
            <div className="flex items-center gap-2">
              <LockIcon className="h-4 w-4 text-panel-muted" />
              <h2 className="text-sm font-semibold">Lås upp med PIN-kod</h2>
            </div>
            <p className="mt-1 text-sm text-panel-muted">
              Ange den sexsiffriga PIN-koden för att bjuda in eller ta bort
              administratörer.
            </p>

            {!data.pinConfigured ? (
              <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                Ingen PIN-kod är inställd ännu. Sätt{" "}
                <code className="font-mono">ADMIN_INVITE_PIN</code> i{" "}
                <code className="font-mono">.env.local</code> till sex siffror
                och ladda om sidan. Koden sparas krypterad i databasen första
                gången den används, och kan sedan ändras här.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className={labelClass}>
                  PIN-kod
                  <input
                    value={pin}
                    onChange={(e) =>
                      setPin(
                        e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH)
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleUnlock();
                      }
                    }}
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="······"
                    aria-label="Sexsiffrig PIN-kod"
                    className={`${inputClass} w-32 text-center font-mono tracking-[0.4em]`}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={pin.length !== PIN_LENGTH || isChecking}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isChecking ? "Kontrollerar…" : "Lås upp"}
                </button>
              </div>
            )}

            {gateError && (
              <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
                {gateError}
              </p>
            )}
          </section>
        ) : (
          <>
            <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
              <span className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 shrink-0" />
                PIN-koden är godkänd. Du kan nu lägga till och ta bort
                administratörer.
              </span>
            </section>

            {/* Bjud in */}
            <section className="rounded-xl border border-border bg-panel p-5 text-panel-foreground">
              <h2 className="text-sm font-semibold">Bjud in en administratör</h2>
              <p className="mt-1 text-sm text-panel-muted">
                Den nya administratören loggar in på{" "}
                <code className="font-mono">/administrator/logga-in</code> med
                adressen och lösenordet du anger här, och får samma behörighet
                som du.
              </p>

              {isFull ? (
                <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                  Alla {maxAdmins} platser är använda. Ta bort en administratör
                  ovan för att kunna bjuda in någon ny.
                </p>
              ) : (
                <form ref={formRef} action={formAction} className="mt-4 space-y-4">
                  {/* Följer med och verifieras igen på servern. */}
                  <input type="hidden" name="pin" value={pin} />

                  <label className={labelClass}>
                    E-postadress
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="off"
                      defaultValue={state?.values?.email}
                      placeholder="namn@bofast.se"
                      aria-invalid={!!state?.errors?.email}
                      className={`${inputClass} max-w-md ${
                        state?.errors?.email ? "border-rose-500" : ""
                      }`}
                    />
                    {state?.errors?.email && (
                      <span className="text-xs text-rose-600">
                        {state.errors.email}
                      </span>
                    )}
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
                    <label className={labelClass}>
                      Lösenord
                      <input
                        name="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        aria-invalid={!!state?.errors?.password}
                        className={`${inputClass} ${
                          state?.errors?.password ? "border-rose-500" : ""
                        }`}
                      />
                      {state?.errors?.password ? (
                        <span className="text-xs text-rose-600">
                          {state.errors.password}
                        </span>
                      ) : (
                        <span className="text-xs text-panel-muted">
                          Minst 8 tecken, både bokstäver och siffror.
                        </span>
                      )}
                    </label>

                    <label className={labelClass}>
                      Upprepa lösenordet
                      <input
                        name="passwordConfirm"
                        type="password"
                        required
                        autoComplete="new-password"
                        aria-invalid={!!state?.errors?.passwordConfirm}
                        className={`${inputClass} ${
                          state?.errors?.passwordConfirm ? "border-rose-500" : ""
                        }`}
                      />
                      {state?.errors?.passwordConfirm && (
                        <span className="text-xs text-rose-600">
                          {state.errors.passwordConfirm}
                        </span>
                      )}
                    </label>
                  </div>

                  {state?.message && (
                    <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
                      {state.message}
                    </p>
                  )}

                  {state?.createdEmail && (
                    <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                      {state.createdEmail} är nu administratör.
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                    <p className="text-xs text-panel-muted">
                      {data.remaining === 1
                        ? "1 plats kvar"
                        : `${data.remaining} platser kvar`}
                    </p>
                    <button
                      type="submit"
                      disabled={pending}
                      className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      {pending ? "Lägger till…" : "Lägg till administratör"}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Byt PIN */}
            <section className="rounded-xl border border-border bg-panel p-5 text-panel-foreground">
              <button
                type="button"
                onClick={() => setShowPinChange((v) => !v)}
                className="text-sm font-semibold hover:text-accent"
              >
                Byt PIN-kod
              </button>

              {showPinChange && (
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <label className={labelClass}>
                    Ny PIN-kod
                    <input
                      value={nextPin}
                      onChange={(e) =>
                        setNextPin(
                          e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH)
                        )
                      }
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="······"
                      aria-label="Ny sexsiffrig PIN-kod"
                      className={`${inputClass} w-32 text-center font-mono tracking-[0.4em]`}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleChangePin}
                    disabled={nextPin.length !== PIN_LENGTH}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Spara ny PIN-kod
                  </button>
                </div>
              )}

              {pinNotice && (
                <p className="mt-3 text-sm text-panel-muted">{pinNotice}</p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
