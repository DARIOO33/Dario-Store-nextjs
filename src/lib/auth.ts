import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import { Pool } from "pg";
import "dotenv/config";
import { sendEmail } from "./email";
import { runAfterResponse } from "./background";
import { verificationCodeEmail } from "./email-templates";
import { getLocale } from "../i18n/server";
import { cleanAccountName } from "./account-name";

// Next bundles this file more than once (pages and /api routes), so the pool lives on globalThis:
// one small pool per server process instead of one per copy, or the database runs out of
// connections ("EMAXCONN max client connections reached").
const shared = globalThis as typeof globalThis & { authPool?: Pool };
const database = (shared.authPool ??= new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10_000,
}));

export const auth = betterAuth({
  database,

  // The site's public address: BETTER_AUTH_URL in production (https://your-domain), localhost in development.
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000/",

  // Email + password. Signing in is blocked until the email is verified, and
  // verification is done with a 6-digit OTP (see the emailOTP plugin below)
  // rather than a clickable link.
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },

  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      otpLength: 6,
      expiresIn: 60 * 5,
      allowedAttempts: 5,
      storeOTP: "hashed",
      async sendVerificationOTP({ email, otp, type }) {
        // Sent after the response on purpose: waiting on the mail server would make
        // "this email exists" observable through response timing. runAfterResponse (not a
        // plain `void`) makes Vercel keep the function running until the email is sent.
        const locale = getLocale().catch(() => "en" as const);
        runAfterResponse(async () => sendEmail({ to: email, ...verificationCodeEmail({ locale: await locale, code: otp, type }) }));
      },
    }),
  ],

  // Every saved name goes through cleanAccountName (see lib/account-name.ts): sign-up, Google, and later edits.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const name = cleanAccountName(user.name ?? "") || user.email.split("@")[0]!;
          return { data: { ...user, name } };
        },
      },
      update: {
        before: async (user) => (typeof user.name === "string" ? { data: { ...user, name: cleanAccountName(user.name) } } : undefined),
      },
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "MEMBER",
        input: false,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});