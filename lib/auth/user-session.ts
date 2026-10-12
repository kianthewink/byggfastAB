import "server-only";
import { cookies } from "next/headers";
import {
  USER_SESSION_COOKIE,
  USER_SESSION_MAX_AGE_SECONDS,
  USER_SESSION_REMEMBER_MAX_AGE_SECONDS,
  signUserToken,
} from "./token";

/** Signs a visitor in. `remember` is the "Håll mig inloggad" checkbox. */
export async function createUserSession(userId: string, remember = false) {
  const maxAge = remember
    ? USER_SESSION_REMEMBER_MAX_AGE_SECONDS
    : USER_SESSION_MAX_AGE_SECONDS;

  const token = await signUserToken(userId, maxAge);
  const store = await cookies();
  store.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function destroyUserSession() {
  const store = await cookies();
  store.delete(USER_SESSION_COOKIE);
}
