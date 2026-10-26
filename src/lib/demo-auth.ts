// DEMO ONLY — not real authentication. Accounts live in this browser only.
// Plaintext passwords are never stored; registered demo accounts keep only a salted SHA-256 hash.

export const DEMO_ACCOUNT = { username: "demo.farmer", password: "Demo@123" } as const;
export const DEMO_CAPTCHA = "K7R2Q";
export const DEMO_CAPTCHAS = [DEMO_CAPTCHA, "M4X9T", "P2H6W", "B8N3Z", "R5D7K"];
const CAP_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L look-alikes
/** New random demo challenge (client-side only — NOT real bot protection). */
export function newCaptcha(prev?: string) {
  let c = "";
  do c = Array.from({ length: 5 }, () => CAP_CHARS[Math.floor(Math.random() * CAP_CHARS.length)]).join("");
  while (c === prev);
  return c;
}
export function checkCaptcha(answer: string, expected: string): string | undefined {
  if (!answer.trim()) return "Enter the characters shown.";
  if (answer.trim().toUpperCase() !== expected.toUpperCase()) return "Characters don't match. Try again — a new code is shown.";
  return undefined;
}

type Key = "user" | "password" | "captcha" | "form" | "name" | "mobile" | "username" | "confirm" | "village" | "district" | "state" | "language";
export type Errors = { [K in Key]?: string };

export function validateLogin(v: { user: string; password: string; captcha: string }, expected: string = DEMO_CAPTCHA): Errors {
  const e: Errors = {};
  if (!v.user.trim()) e.user = "Enter your username or mobile number.";
  if (!v.password) e.password = "Enter your password.";
  const cap = checkCaptcha(v.captcha, expected);
  if (cap) e.captcha = cap;
  return e;
}
export const isDemoCredentials = (user: string, password: string) =>
  user.trim().toLowerCase() === DEMO_ACCOUNT.username && password === DEMO_ACCOUNT.password;

export type RegisterValues = {
  name: string; mobile: string; username: string; password: string; confirm: string;
  village: string; district: string; state: string; language: string;
};

export function normalizeMobile(m: string) {
  return m.replace(/[\s-]/g, "").replace(/^\+91/, "");
}

export function validateRegister(v: RegisterValues): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Enter your full name.";
  if (!v.mobile.trim()) e.mobile = "Enter your mobile number.";
  else if (!/^[6-9]\d{9}$/.test(normalizeMobile(v.mobile))) e.mobile = "Enter a valid 10-digit mobile number starting with 6–9.";
  if (!v.username.trim()) e.username = "Choose a username.";
  else if (!/^[a-zA-Z0-9._]{4,20}$/.test(v.username.trim())) e.username = "Use 4–20 letters, numbers, dots or underscores.";
  if (!v.password) e.password = "Create a password.";
  else if (v.password.length < 8) e.password = "Password must be at least 8 characters.";
  if (!v.confirm) e.confirm = "Confirm your password.";
  else if (v.password && v.confirm !== v.password) e.confirm = "Passwords do not match.";
  if (!v.village.trim()) e.village = "Enter your village.";
  if (!v.state) e.state = "Select your state.";
  if (!v.district) e.district = "Select your district.";
  if (!v.language) e.language = "Select a language.";
  return e;
}

