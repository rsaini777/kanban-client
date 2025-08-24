"use client";

import { signIn, signOut } from "next-auth/react";

interface LoginProps {
  email: string;
  password: string;
}

interface LoginResponse {
  error?: string | null;
  status: number;
  ok: boolean;
  url?: string | null;
}

/**
 * Login user using credentials provider
 */
export const loginUser = async ({ email, password }: LoginProps): Promise<LoginResponse> => {
  try {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    return res as LoginResponse;
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      error: error?.message || "Login failed",
      status: 500,
      ok: false,
    };
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    await signOut({ redirect: true, callbackUrl: "/" });
  } catch (error: any) {
    console.error("Logout error:", error);
  }
};
