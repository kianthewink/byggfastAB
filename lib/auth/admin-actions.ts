"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "./dal";
import {
  type AdminSummary,
  createAdmin,
  deleteAdmin,
  isRootAdmin,
  listAdmins,
} from "./admin-accounts";
import {
  isInvitePinConfigured,
  isValidPinFormat,
  lockoutMinutesRemaining,
  setInvitePin,
  verifyInvitePin,
} from "./invite-pin";
import {
  type AdminInviteField,
  type FormState,
  validateAdminInvite,
} from "./validation";
import { MAX_INVITED_ADMINS } from "@/lib/db/schema";

/**
 * Server actions behind the "Administratörer" page.
 *
 * Every one of these is a public endpoint, so each re-checks two things for
 * itself: that the caller holds an admin session (verifySession) and that
 * they supplied the correct six-digit PIN. Passing the PIN gate in the UI
 * grants nothing on its own — the PIN travels with each mutating call and is
 * verified again server-side, because a client could simply call the invite
 * action directly and skip the gate entirely.
 */

const ADMINS_PATH = "/administrator/administratorer";

export type PinGateState =
  | { status: "ok" }
  | { status: "wrong"; message: string }
  | { status: "unconfigured"; message: string }
  | { status: "locked"; message: string };

/** The failure half of PinGateState — every variant carries a message. */
type PinFailureState = Extract<PinGateState, { message: string }>;

function pinFailureState(
  result: "wrong" | "unconfigured" | "locked"
): PinFailureState {
  if (result === "locked") {
    const minutes = lockoutMinutesRemaining();
    return {
      status: "locked",
      message: `För många felaktiga försök. Försök igen om ${minutes} ${
        minutes === 1 ? "minut" : "minuter"
      }.`,
    };
  }
  if (result === "unconfigured") {
    return {
      status: "unconfigured",
      message:
        "Ingen PIN-kod är inställd ännu. Sätt ADMIN_INVITE_PIN i .env.local till sex siffror och ladda om sidan.",
    };
  }
  return { status: "wrong", message: "Fel PIN-kod." };
}

/** Unlocks the invite form in the UI. Grants nothing on its own. */
export async function checkPinAction(pin: string): Promise<PinGateState> {
  await verifySession();
  const result = await verifyInvitePin(pin);
  return result === "ok" ? { status: "ok" } : pinFailureState(result);
}

export interface AdminPageData {
  admins: AdminSummary[];
  /** Free invite slots left, 0..MAX_INVITED_ADMINS. */
  remaining: number;
  pinConfigured: boolean;
  rootEmail: string | null;
  /** The signed-in admin's own address — root or invited either way, so the
   *  page can offer to log out the account that's actually browsing it. */
  currentEmail: string;
}

export async function getAdminPageData(): Promise<AdminPageData> {
  const session = await verifySession();
  const admins = await listAdmins();
  return {
    admins,
    remaining: Math.max(0, MAX_INVITED_ADMINS - admins.length),
    pinConfigured: await isInvitePinConfigured(),
    rootEmail: isRootAdmin(session.email) ? session.email : null,
    currentEmail: session.email,
  };
}

export type InviteState = FormState<AdminInviteField> & {
  /** Set on success so the form can show a confirmation and reset. */
  createdEmail?: string;
};

/**
 * Creates an administrator. The PIN rides along in the form data and is
 * re-verified here; the cap is enforced by the database, not by this code.
 */
export async function inviteAdminAction(
  _prevState: InviteState | undefined,
  formData: FormData
): Promise<InviteState> {
  const session = await verifySession();

  const pin = String(formData.get("pin") ?? "");
  const pinResult = await verifyInvitePin(pin);
  if (pinResult !== "ok") {
    return { message: pinFailureState(pinResult).message };
  }

  const result = validateAdminInvite(formData);
  // The e-mail is echoed back so a rejected submit doesn't wipe it; the
  // passwords deliberately are not.
  const values = { email: String(formData.get("email") ?? "").trim() };

  if (!result.ok) return { errors: result.errors, values };

  const { email, password } = result.data;

  if (isRootAdmin(email)) {
    return {
      errors: { email: "Den adressen är redan huvudadministratör." },
      values,
    };
  }

  const outcome = await createAdmin(email, password, session.email);

  if (!outcome.ok) {
    if (outcome.reason === "duplicate") {
      return {
        errors: { email: "Den e-postadressen är redan administratör." },
        values,
      };
    }
    if (outcome.reason === "full") {
      return {
        message: `Det finns redan ${MAX_INVITED_ADMINS} inbjudna administratörer. Ta bort en innan du lägger till en ny.`,
        values,
      };
    }
    return {
      message: "Något gick fel när administratören skulle läggas till. Försök igen.",
      values,
    };
  }

  revalidatePath(ADMINS_PATH);
  return { createdEmail: outcome.admin.email };
}

export type RevokeResult = { ok: true } | { ok: false; message: string };

/** Removes an invited administrator, freeing their slot. PIN-gated. */
export async function revokeAdminAction(
  id: string,
  pin: string
): Promise<RevokeResult> {
  await verifySession();

  const pinResult = await verifyInvitePin(pin);
  if (pinResult !== "ok") {
    return { ok: false, message: pinFailureState(pinResult).message };
  }

  if (typeof id !== "string" || id.length === 0) {
    return { ok: false, message: "Okänd administratör." };
  }

  try {
    await deleteAdmin(id);
  } catch (error) {
    console.error(
      "Admin revoke failed:",
      error instanceof Error ? error.name : "unknown error"
    );
    return { ok: false, message: "Kunde inte ta bort administratören." };
  }

  revalidatePath(ADMINS_PATH);
  return { ok: true };
}

/** Rotates the PIN. Requires the current one, so a stolen session alone
 *  cannot lock the real administrator out of the invite flow. */
export async function changePinAction(
  currentPin: string,
  nextPin: string
): Promise<RevokeResult> {
  await verifySession();

  const pinResult = await verifyInvitePin(currentPin);
  if (pinResult !== "ok") {
    return { ok: false, message: pinFailureState(pinResult).message };
  }

  if (!isValidPinFormat(nextPin)) {
    return { ok: false, message: "Den nya PIN-koden måste vara exakt sex siffror." };
  }

  await setInvitePin(nextPin);
  revalidatePath(ADMINS_PATH);
  return { ok: true };
}
