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

/**
 * End-to-end checks for administrator invites against the real database.
 *
 * This writes to `admin_accounts` and `admin_secrets`, so it snapshots both
 * first and restores them at the end — running it must leave the database
 * exactly as it found it, including an existing PIN.
 */
async function main() {
  const { db } = await import("../lib/db/client");
  const { adminAccounts, adminSecrets, INVITE_PIN_KEY, MAX_INVITED_ADMINS } =
    await import("../lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { createAdmin, deleteAdmin, findAdminByEmail, listAdmins, isRootAdmin } =
    await import("../lib/auth/admin-accounts");
  const { setInvitePin, verifyInvitePin, isInvitePinConfigured } = await import(
    "../lib/auth/invite-pin"
  );
  const { isValidPinFormat } = await import("../lib/auth/pin-format");
  const { verifyPassword } = await import("../lib/auth/password");
  const { validateAdminInvite } = await import("../lib/auth/validation");

  const results: [string, boolean][] = [];
  const check = (name: string, pass: boolean) => results.push([name, pass]);

  // --- Snapshot everything this script is about to touch --------------------
  const existingAdmins = await db.select().from(adminAccounts);
  const [existingPin] = await db
    .select()
    .from(adminSecrets)
    .where(eq(adminSecrets.key, INVITE_PIN_KEY));

  if (existingAdmins.length > 0) {
    console.log(
      `NOTE: ${existingAdmins.length} existing admin row(s) will be restored afterwards.`
    );
  }

  try {
    await db.delete(adminAccounts);

    // --- PIN format ---------------------------------------------------------
    check("six digits accepted", isValidPinFormat("012345"));
    check("five digits rejected", !isValidPinFormat("01234"));
    check("seven digits rejected", !isValidPinFormat("0123456"));
    check("letters rejected", !isValidPinFormat("12a456"));
    check("spaces rejected", !isValidPinFormat("12 456"));
    check("empty rejected", !isValidPinFormat(""));

    // --- PIN storage --------------------------------------------------------
    await setInvitePin("482913");
    check("PIN reports as configured", await isInvitePinConfigured());

    const [pinRow] = await db
      .select()
      .from(adminSecrets)
      .where(eq(adminSecrets.key, INVITE_PIN_KEY));
    check("PIN is not stored in clear text", !pinRow.valueHash.includes("482913"));
    check("PIN is stored as a scrypt digest", pinRow.valueHash.startsWith("scrypt$"));

    check("correct PIN verifies", (await verifyInvitePin("482913")) === "ok");
    check("wrong PIN rejected", (await verifyInvitePin("482914")) === "wrong");
    check("malformed PIN rejected", (await verifyInvitePin("abc")) === "wrong");

    // Rotating replaces rather than adding a second row.
    await setInvitePin("100200");
    check("rotated PIN verifies", (await verifyInvitePin("100200")) === "ok");
    check("old PIN no longer works", (await verifyInvitePin("482913")) === "wrong");
    const pinRows = await db
      .select()
      .from(adminSecrets)
      .where(eq(adminSecrets.key, INVITE_PIN_KEY));
    check("rotation keeps exactly one PIN row", pinRows.length === 1);

    // --- Invite validation --------------------------------------------------
    const form = (over: Record<string, string>) => {
      const fd = new FormData();
      const base: Record<string, string> = {
        email: "ny@bofast.se",
        password: "Bofast2026",
        passwordConfirm: "Bofast2026",
        ...over,
      };
      for (const [k, v] of Object.entries(base)) if (v !== "") fd.set(k, v);
      return fd;
    };
    check("valid invite accepted", validateAdminInvite(form({})).ok);
    check("bad e-mail rejected", !validateAdminInvite(form({ email: "nope" })).ok);
    check(
      "short password rejected",
      !validateAdminInvite(form({ password: "Ab1", passwordConfirm: "Ab1" })).ok
    );
    check(
      "digits-only password rejected",
      !validateAdminInvite(
        form({ password: "12345678", passwordConfirm: "12345678" })
      ).ok
    );
    check(
      "mismatched confirmation rejected",
      !validateAdminInvite(form({ passwordConfirm: "Bofast2027" })).ok
    );

    // --- The cap, which is what the whole feature hinges on -----------------
    const first = await createAdmin("ett@bofast.se", "Bofast2026", "root@bofast.se");
    const second = await createAdmin("tva@bofast.se", "Bofast2026", "root@bofast.se");
    check("first invite succeeds", first.ok);
    check("second invite succeeds", second.ok);

    const third = await createAdmin("tre@bofast.se", "Bofast2026", "root@bofast.se");
    check(
      `third invite refused past MAX_INVITED_ADMINS=${MAX_INVITED_ADMINS}`,
      !third.ok && third.reason === "full"
    );

    // With every slot taken, "full" is the honest answer even for a repeat
    // address — there is no slot to put them in either way.
    const duplicateWhenFull = await createAdmin(
      "ETT@bofast.se",
      "Bofast2026",
      "root@bofast.se"
    );
    check(
      "repeat e-mail refused as full when no slot is free",
      !duplicateWhenFull.ok && duplicateWhenFull.reason === "full"
    );

    check("exactly two admins exist", (await listAdmins()).length === 2);

    // The duplicate path proper: free a slot first, so the insert is actually
    // attempted and the unique index on e-mail is what refuses it.
    if (second.ok) await deleteAdmin(second.admin.id);
    const duplicate = await createAdmin(
      "ETT@bofast.se",
      "Bofast2026",
      "root@bofast.se"
    );
    check(
      "duplicate e-mail refused as duplicate (case-insensitively)",
      !duplicate.ok && duplicate.reason === "duplicate"
    );
    check(
      "refused duplicate created no row",
      (await listAdmins()).length === 1
    );
    // Put the second admin back so the slot arithmetic below is unchanged.
    const restored = await createAdmin(
      "tva@bofast.se",
      "Bofast2026",
      "root@bofast.se"
    );
    check("slot reusable after a refused duplicate", restored.ok);

    // --- What login actually reads -----------------------------------------
    const account = await findAdminByEmail("ett@bofast.se");
    check("invited admin is findable by e-mail", account !== null);
    check(
      "lookup is case-insensitive",
      (await findAdminByEmail("  ETT@BOFAST.SE ")) !== null
    );
    check(
      "password is not stored in clear text",
      account !== null && !account.passwordHash.includes("Bofast2026")
    );
    check(
      "correct password verifies",
      account !== null && (await verifyPassword("Bofast2026", account.passwordHash))
    );
    check(
      "wrong password rejected",
      account !== null &&
        !(await verifyPassword("Bofast2027", account.passwordHash))
    );
    check("unknown e-mail returns null", (await findAdminByEmail("x@y.se")) === null);

    // --- Revoking frees the slot again --------------------------------------
    if (first.ok) await deleteAdmin(first.admin.id);
    check("one admin left after revoke", (await listAdmins()).length === 1);
    const afterRevoke = await createAdmin(
      "tre@bofast.se",
      "Bofast2026",
      "root@bofast.se"
    );
    check("freed slot can be reused", afterRevoke.ok);
    check("back to two admins", (await listAdmins()).length === 2);

    // --- Root admin is never a database row ---------------------------------
    const rootEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (rootEmail) {
      check("root admin recognised", isRootAdmin(rootEmail.toUpperCase()));
      check(
        "root admin has no admin_accounts row",
        (await findAdminByEmail(rootEmail)) === null
      );
    }
    check("a random address is not the root admin", !isRootAdmin("nobody@x.se"));

    // --- Revocation must actually end the session ---------------------------
    // verifySession() re-checks the address against the database on every
    // request precisely so a revoked admin's week-long cookie stops working
    // immediately. These are the two lookups it relies on.
    // Clear the slots first — createAdmin would otherwise return "full" and
    // the whole block below would skip without ever failing.
    await db.delete(adminAccounts);
    const victim = await createAdmin(
      "avstangd@bofast.se",
      "Bofast2026",
      "root@bofast.se"
    );
    check("revocation fixture created", victim.ok);
    check(
      "revoked-to-be admin resolves while active",
      (await findAdminByEmail("avstangd@bofast.se")) !== null
    );
    if (victim.ok) await deleteAdmin(victim.admin.id);
    check(
      "revoked admin no longer resolves, so their cookie stops working",
      (await findAdminByEmail("avstangd@bofast.se")) === null
    );
    check(
      "revoked admin is not the root admin either",
      !isRootAdmin("avstangd@bofast.se")
    );
  } finally {
    // --- Restore the database to exactly how it was found --------------------
    await db.delete(adminAccounts);
    for (const row of existingAdmins) {
      await db.insert(adminAccounts).values(row);
    }
    await db.delete(adminSecrets).where(eq(adminSecrets.key, INVITE_PIN_KEY));
    if (existingPin) {
      await db.insert(adminSecrets).values(existingPin);
    }
    console.log("\nDatabase restored to its original state.");
  }

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
