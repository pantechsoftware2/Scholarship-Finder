// app/lib/env.ts

// Gemini
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Supabase (public + server)
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Resend
export const RESEND_API_KEY = process.env.RESEND_API_KEY;

// URLs
export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
export const NEXT_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://fundmystudyabroad.com";
export const NEXT_PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fundmystudyabroad.com";

// Helpers with basic safety (for server-side usage)
function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const SERVER_ENV = {
  GEMINI_API_KEY: required("GEMINI_API_KEY", GEMINI_API_KEY),
  SUPABASE_URL: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    NEXT_PUBLIC_SUPABASE_URL
  ),
  SUPABASE_SERVICE_ROLE_KEY: required(
    "SUPABASE_SERVICE_ROLE_KEY",
    SUPABASE_SERVICE_ROLE_KEY
  ),
  RESEND_API_KEY: required("RESEND_API_KEY", RESEND_API_KEY),
  BASE_URL,
};
