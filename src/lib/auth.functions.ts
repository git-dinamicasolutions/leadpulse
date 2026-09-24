import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { loginUser, logoutUser, getSession, type UserSession, type UserRole } from "./auth.server";

export type { UserSession, UserRole };

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({
      email: z.string().email(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    return await loginUser(data.email);
  });

export const logoutFn = createServerFn({ method: "POST" })
  .handler(async () => {
    return await logoutUser();
  });

export const getSessionFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return await getSession();
  });
