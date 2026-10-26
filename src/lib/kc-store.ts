// KrishiConnect demo store — client-side only, fictional data.
// Persists ONLY non-sensitive demo data (bookings, statuses, preferences,
// notification read flags, editable profile fields) in localStorage.
// No passwords, tokens, identity numbers or bank credentials are ever stored.
import { useSyncExternalStore } from "react";
import type { Tone } from "@/components/kc/ui";
import { STATES_DISTRICTS } from "@/lib/locations";
import { farmer as baseFarmer, crops as baseCrops, documents as baseDocs } from "@/lib/mock-data";

/* ---------------- Static demo reference data ---------------- */

export type Centre = {
  id: string; name: string; address: string; state: string; district: string; distanceKm: number; waitMin: number;
  open: boolean; hours: string; crops: string[]; queue: number; slotCapacity: number;
};

// All sample centres are fictional demo locations tagged with a state and district
// from the shared dataset in @/lib/locations.
export const CENTRES: Centre[] = [
  { id: "gohana-3", name: "Gohana Grain Market — Centre 3", address: "Plot 12, Old Sonipat Rd, Gohana (fictional)", state: "Haryana", district: "Panipat", distanceKm: 18, waitMin: 45, open: true, hours: "8:00 AM – 6:00 PM", crops: ["Wheat", "Mustard"], queue: 14, slotCapacity: 6 },
  { id: "sonipat-anaj", name: "Sonipat Anaj Mandi", address: "Shed 4, Sector 14, Sonipat (fictional)", state: "Haryana", district: "Panipat", distanceKm: 26, waitMin: 15, open: true, hours: "8:00 AM – 5:00 PM", crops: ["Wheat", "Paddy"], queue: 5, slotCapacity: 6 },
  { id: "kharkhoda", name: "Kharkhoda Procurement Yard", address: "Yard B, Rohtak Rd, Kharkhoda (fictional)", state: "Haryana", district: "Rohtak", distanceKm: 34, waitMin: 130, open: true, hours: "9:00 AM – 6:00 PM", crops: ["Wheat"], queue: 31, slotCapacity: 6 },
  { id: "ganaur", name: "Ganaur Purchase Centre", address: "Gate 2, GT Road, Ganaur (fictional)", state: "Haryana", district: "Panipat", distanceKm: 41, waitMin: 20, open: true, hours: "8:30 AM – 5:30 PM", crops: ["Wheat", "Barley", "Gram"], queue: 7, slotCapacity: 6 },
  { id: "rai-coop", name: "Rai Cooperative Centre", address: "Block C, Rai Industrial Area (fictional)", state: "Haryana", district: "Karnal", distanceKm: 47, waitMin: 0, open: false, hours: "Opens Mon 8:00 AM", crops: ["Paddy"], queue: 0, slotCapacity: 6 },
  ...genDemoCentres(),
];

// 3 fictional DEMO centres for every state/district in the shared location dataset.
function genDemoCentres(): Centre[] {
  const kinds = ["Kisan Mandi", "Krishi Upaj Kendra", "Cooperative Procurement Centre"];
  const cropSets = [["Wheat", "Mustard", "Gram"], ["Paddy", "Wheat"], ["Barley", "Gram", "Mustard"], ["Paddy", "Gram"], ["Wheat", "Barley", "Paddy"]];
  const hrs = ["8:00 AM – 6:00 PM", "8:30 AM – 5:30 PM", "9:00 AM – 5:00 PM"];
  const out: Centre[] = [];
  let n = 0;
  for (const [st, ds] of Object.entries(STATES_DISTRICTS)) for (const d of ds) kinds.forEach((k, i) => {
    n++;
    const slug = `${st}-${d}-${i + 1}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    out.push({ id: `demo-${slug}`, name: `DEMO ${d} ${k}`, address: `Plot ${10 + ((n * 7) % 80)}, Mandi Road, ${d}, ${st} (fictional demo address)`, state: st, district: d,
      distanceKm: 6 + ((n * 13) % 40), waitMin: [10, 25, 50, 90][n % 4], open: true, hours: hrs[i], crops: cropSets[n % cropSets.length], queue: 3 + ((n * 5) % 25), slotCapacity: 6 });
  });
  return out;
}

export const CROPS = [
  { crop: "Wheat", variety: "HD-2967", msp: 2450, expectedQtl: 42 },
  { crop: "Mustard", variety: "Pusa Bold", msp: 5950, expectedQtl: 12 },
  { crop: "Paddy", variety: "PR-126", msp: 2320, expectedQtl: 55 },
  { crop: "Barley", variety: "BH-946", msp: 1980, expectedQtl: 10 },
  { crop: "Gram", variety: "HC-5", msp: 5650, expectedQtl: 8 },
];

export const SLOT_TIMES = [510, 630, 750, 870]; // minutes from midnight: 8:30, 10:30, 12:30, 14:30
export const DEMO_TODAY = "2026-10-09";
export const BOOKABLE_DATES = ["2026-10-10", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15"];

export const getCentre = (id: string) => CENTRES.find((c) => c.id === id);
export const getCrop = (name: string) => CROPS.find((c) => c.crop === name);

/* ---------------- Formatting helpers (timezone-independent) ---------------- */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[wd]}, ${d} ${MONTHS[m - 1]} ${y}`;
}
export function fmtTime(min: number) {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60), mm = m % 60;
  return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
export function fmtDur(min: number) {
  if (min <= 0) return "—";
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h} hr${m ? ` ${m} min` : ""}` : `${m} min`;
}
export function fmtStamp(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" });
}
export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function crowd(c: Centre): { label: string; tone: Tone } {
  if (!c.open) return { label: "Closed today", tone: "neutral" };
  if (c.waitMin >= 90) return { label: "Busy", tone: "danger" };
  if (c.waitMin >= 30) return { label: "Moderate", tone: "warning" };
  return { label: "Low crowd", tone: "success" };
}

/* ---------------- Types ---------------- */

export type Status = "Booked" | "In Queue" | "Processing" | "Completed" | "Cancelled";
export const FLOW: Status[] = ["Booked", "In Queue", "Processing", "Completed"];
export const statusTone: Record<Status, Tone> = { Booked: "info", "In Queue": "warning", Processing: "warning", Completed: "success", Cancelled: "neutral" };
export type PayStatus = "Pending" | "Processing" | "Paid";
export const payTone: Record<PayStatus, Tone> = { Pending: "neutral", Processing: "warning", Paid: "success" };

export type Booking = {
  id: string; crop: string; qty: number; centreId: string; date: string; slot: number;
  status: Status; history: { status: Status; at: string; by: string }[];
  paymentStatus: PayStatus; createdAt: string;
};
export type Notice = { id: string; title: string; body: string; at: string; type: "success" | "info" | "warning" | "danger"; read: boolean };
export type Profile = { name: string; mobile: string; email: string; village: string; block: string; district: string; state: string; language: string; preferredCrop: string; cropPrefs: string[] };

export type CropEntry = { id: string; crop: string; variety: string; areaAcres: number; season: string; expectedQtl: number };
type State = { v: 2; uid: string; farmerId: string; bookings: Booking[]; notices: Notice[]; profile: Profile; crops: CropEntry[]; selectedCentreId?: string; docUploads?: Record<string, string> };

/* ---------------- Seed ---------------- */

export const DEMO_UID = "demo-farmer";
const seedCrops = (): CropEntry[] => baseCrops.map((c, i) => ({ id: `crop-demo-${i + 1}`, crop: c.crop, variety: c.variety, areaAcres: parseFloat(c.area), season: c.season, expectedQtl: parseFloat(c.expected) }));

/** Fresh state for a newly registered demo farmer: their own profile, no bookings, no crops. */
function seedNewUser(a: Account): State {
  return {
    v: 2, uid: a.id, farmerId: a.farmerId, bookings: [], crops: [],
    profile: { name: a.name, mobile: a.mobile, email: "", village: a.village, block: "", district: a.district, state: a.state, language: a.language, preferredCrop: "", cropPrefs: [] },
    notices: [{ id: noticeId(), title: `Welcome, ${a.name} (demo)`, body: "Your demo farmer account was created in this browser. Add your crops, then book a procurement slot.", at: nowIso(), type: "success", read: false }],
  };
}

const seed = (): State => ({
  v: 2, uid: DEMO_UID, farmerId: baseFarmer.id, crops: seedCrops(),
  profile: {
    name: baseFarmer.name, mobile: baseFarmer.mobile, email: baseFarmer.email, village: baseFarmer.village,
    block: baseFarmer.block, district: baseFarmer.district, state: baseFarmer.state, language: baseFarmer.language,
    preferredCrop: "Wheat", cropPrefs: ["Wheat", "Mustard", "Paddy"],
  },
  bookings: [
    { id: "PRC-HR-2026-118734", crop: "Wheat", qty: 42, centreId: "gohana-3", date: "2026-10-10", slot: 630, status: "Booked", paymentStatus: "Pending", createdAt: "2026-10-06T04:10:00Z",
      history: [{ status: "Booked", at: "2026-10-06T04:10:00Z", by: "Farmer" }] },
    { id: "PRC-HR-2026-097112", crop: "Mustard", qty: 12, centreId: "gohana-3", date: "2026-04-21", slot: 510, status: "Completed", paymentStatus: "Paid", createdAt: "2026-04-15T05:00:00Z",
      history: [{ status: "Booked", at: "2026-04-15T05:00:00Z", by: "Farmer" }, { status: "In Queue", at: "2026-04-21T03:20:00Z", by: "Demo operator" }, { status: "Processing", at: "2026-04-21T04:05:00Z", by: "Demo operator" }, { status: "Completed", at: "2026-04-21T05:00:00Z", by: "Demo operator" }] },
    { id: "PRC-HR-2025-310455", crop: "Paddy", qty: 55, centreId: "sonipat-anaj", date: "2025-10-18", slot: 750, status: "Completed", paymentStatus: "Paid", createdAt: "2025-10-12T05:00:00Z",
      history: [{ status: "Booked", at: "2025-10-12T05:00:00Z", by: "Farmer" }, { status: "In Queue", at: "2025-10-18T07:00:00Z", by: "Demo operator" }, { status: "Processing", at: "2025-10-18T07:20:00Z", by: "Demo operator" }, { status: "Completed", at: "2025-10-18T08:45:00Z", by: "Demo operator" }] },
  ],
  notices: [
    { id: "n1", title: "Booking confirmed (demo)", body: "PRC-HR-2026-118734 · Wheat · Sat, 10 Oct 2026, 10:30 AM at Gohana Centre 3.", at: "2026-10-06T04:10:00Z", type: "success", read: false },
    { id: "n2", title: "Reminder: visit tomorrow", body: "Open Know Before You Go to see your estimated departure time.", at: "2026-10-09T03:30:00Z", type: "warning", read: false },
    { id: "n3", title: "Upload passport photograph", body: "One document is missing from your profile.", at: "2026-10-07T06:00:00Z", type: "danger", read: false },
    { id: "n4", title: "Mustard payment marked Paid (illustrative)", body: "Demo payment status for PRC-HR-2026-097112 is Paid. No real money is transferred by this demo.", at: "2026-04-24T06:00:00Z", type: "info", read: true },
  ],
});

/* ---------------- Store plumbing ---------------- */

// Storage layout (demo only, this browser):
//  kc-demo-accounts-v1   → registered demo accounts (no plaintext passwords; salted SHA-256 hash only)
//  kc-demo-session-v1    → id of the signed-in demo user
//  kc-demo-state-v2:<id> → that user's bookings / crops / notices / profile
const LEGACY_KEY = "kc-demo-state-v1";
const ACCOUNTS_KEY = "kc-demo-accounts-v1";
const SESSION_KEY = "kc-demo-session-v1";
const stateKey = (uid: string) => `kc-demo-state-v2:${uid}`;

export type Account = { id: string; farmerId: string; username: string; name: string; mobile: string; village: string; district: string; state: string; language: string; salt: string; hash: string; createdAt: string };

const SERVER = seed();
let state: State = SERVER;
let sessionUid: string | null = null;
let loaded = false;
const listeners = new Set<() => void>();

const ls = () => (typeof window === "undefined" ? null : window.localStorage);
function readJSON<T>(k: string): T | null {
  try { const r = ls()?.getItem(k); return r ? (JSON.parse(r) as T) : null; } catch { return null; }
}
function writeJSON(k: string, v: unknown) { try { ls()?.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }

function valid(s: unknown): s is State {
  const x = s as State;
  return !!x && x.v === 2 && typeof x.uid === "string" && Array.isArray(x.bookings) && Array.isArray(x.notices) && Array.isArray(x.crops) && !!x.profile && typeof x.profile.name === "string";
}
function readState(uid: string): State {
  const s = readJSON<State>(stateKey(uid));
  if (valid(s) && s.uid === uid) return s;
  if (uid === DEMO_UID) {
    // migrate the old single-user demo data, if present and sane
    const old = readJSON<Omit<State, "v" | "uid" | "farmerId" | "crops"> & { v: number }>(LEGACY_KEY);
    const base = seed();
    if (old && old.v === 1 && Array.isArray(old.bookings) && Array.isArray(old.notices) && old.profile) {
      try { ls()?.removeItem(LEGACY_KEY); } catch { /* ignore */ }
      return { ...base, bookings: old.bookings, notices: old.notices, profile: old.profile, selectedCentreId: old.selectedCentreId };
    }
    return base;
  }
  const acc = getAccounts().find((a) => a.id === uid);
  return acc ? seedNewUser(acc) : seed();
}
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const sess = readJSON<{ uid?: string }>(SESSION_KEY);
  const uid = sess?.uid;
  sessionUid = uid && (uid === DEMO_UID || getAccounts().some((a) => a.id === uid)) ? uid : null;
  state = sessionUid ? readState(sessionUid) : SERVER;
}
function emit() { listeners.forEach((l) => l()); }
function set(next: State) {
  if (!sessionUid || next.uid !== sessionUid) return; // never write one user's data into another account
  state = next;
  writeJSON(stateKey(next.uid), next);
  emit();
}
function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

export function useKC() {
  return useSyncExternalStore(subscribe, () => { load(); return state; }, () => SERVER);
}
/** undefined = not yet known (server render), null = signed out, string = signed-in demo user id */
export function useSessionUid() {
  return useSyncExternalStore(subscribe, () => { load(); return sessionUid; }, () => undefined);
}

/* ---------------- Demo accounts (NOT production authentication) ---------------- */

export function getAccounts(): Account[] {
  const a = readJSON<Account[]>(ACCOUNTS_KEY);
  return Array.isArray(a) ? a.filter((x) => x && typeof x.id === "string" && typeof x.username === "string" && typeof x.hash === "string") : [];
}
async function hashPw(salt: string, pw: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${pw}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const rid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

export function signInAs(uid: string) {
  load();
  sessionUid = uid;
  writeJSON(SESSION_KEY, { uid });
  state = readState(uid);
  writeJSON(stateKey(uid), state);
  emit();
}
export function signOut() {
  load();
  sessionUid = null;
  try { ls()?.removeItem(SESSION_KEY); } catch { /* ignore */ }
  state = SERVER;
  emit();
}

export type NewAccount = { name: string; mobile: string; username: string; password: string; village: string; district: string; state: string; language: string };
export async function registerAccount(v: NewAccount, reservedUsername: string): Promise<{ ok: true; account: Account } | { ok: false; field: "username" | "mobile"; error: string }> {
  load();
  const accounts = getAccounts();
  const username = v.username.trim().toLowerCase();
  if (username === reservedUsername || accounts.some((a) => a.username === username)) return { ok: false, field: "username", error: "This username is already taken. Choose another." };
  if (accounts.some((a) => a.mobile === v.mobile)) return { ok: false, field: "mobile", error: "An account with this mobile number already exists. Sign in instead." };
  const salt = rid();
  const account: Account = {
    id: `user-${rid()}`, farmerId: `HR-FRM-DEMO-${Math.floor(100000 + Math.random() * 900000)}`, username, name: v.name.trim(), mobile: v.mobile,
    village: v.village.trim(), district: v.district, state: v.state, language: v.language, salt, hash: await hashPw(salt, v.password), createdAt: nowIso(),
  };
  writeJSON(ACCOUNTS_KEY, [...accounts, account]);
  writeJSON(stateKey(account.id), seedNewUser(account));
  return { ok: true, account };
}
/** Returns the user id when username/mobile + password match a registered demo account. */
export async function checkRegistered(user: string, password: string): Promise<string | null> {
  const u = user.trim().toLowerCase();
  const a = getAccounts().find((x) => x.username === u || x.mobile === u.replace(/[\s-]/g, "").replace(/^\+91/, ""));
  if (!a) return null;
  return (await hashPw(a.salt, password)) === a.hash ? a.id : null;
}

const nowIso = () => new Date().toISOString();
const noticeId = () => `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const notice = (n: Omit<Notice, "id" | "at" | "read">): Notice => ({ ...n, id: noticeId(), at: nowIso(), read: false });

/* ---------------- Slot availability ---------------- */

// Deterministic baseline of other farmers' demo bookings (stable across pages/reloads).
function baseline(centreId: string, date: string, slot: number) {
  let h = 0;
  for (const ch of `${centreId}|${date}|${slot}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const c = getCentre(centreId)!;
  const pressure = c.waitMin >= 90 ? 5 : c.waitMin >= 30 ? 3 : 1;
  return Math.min(c.slotCapacity, pressure + (h % 3));
}
export function slotInfo(s: State, centreId: string, date: string, slot: number) {
  const c = getCentre(centreId);
  if (!c || !c.open) return { capacity: 0, booked: 0, left: 0 };
  const mine = s.bookings.filter((b) => b.centreId === centreId && b.date === date && b.slot === slot && b.status !== "Cancelled").length;
  const booked = Math.min(c.slotCapacity, baseline(centreId, date, slot) + mine);
  return { capacity: c.slotCapacity, booked, left: c.slotCapacity - booked };
}
export function centreDayLeft(s: State, centreId: string, date: string) {
  return SLOT_TIMES.reduce((a, t) => a + slotInfo(s, centreId, date, t).left, 0);
}
export function centreDayCapacity(centreId: string) {
  const c = getCentre(centreId);
  return c && c.open ? c.slotCapacity * SLOT_TIMES.length : 0;
}

/* ---------------- Know Before You Go estimates ---------------- */

export function journey(b: Pick<Booking, "centreId" | "slot" | "qty">) {
  const c = getCentre(b.centreId) ?? { distanceKm: 20, waitMin: 15 };
  const travel = Math.max(10, Math.round((c.distanceKm * 2.2) / 5) * 5); // sample avg ~27 km/h on rural roads
  const buffer = 15;
  const arrive = b.slot - buffer;
  const departure = arrive - travel;
  const wait = c.waitMin;
  const processing = Math.round((30 + b.qty) / 5) * 5;
  const completion = b.slot + wait + processing;
  return { travel, buffer, arrive, departure, wait, processing, completion, distanceKm: c.distanceKm };
}

export const CHECKLIST = [
  "Aadhaar card (original) — for identity check at the gate",
  "Booking confirmation with demo procurement ID",
  "Land record copy (Jamabandi)",
  "Bank passbook first page",
  "Produce cleaned and dried within moisture limits",
  "Vehicle registration papers",
  "Drinking water and a cloth to cover grain",
];

/* ---------------- Actions ---------------- */

export type BookInput = { crop: string; qty: number; centreId: string; date: string; slot: number };
export function validateBooking(s: State, i: Partial<BookInput>): Record<string, string> {
  const e: Record<string, string> = {};
  const c = i.centreId ? getCentre(i.centreId) : undefined;
  if (!i.crop) e.crop = "Select a crop.";
  if (!i.qty || !Number.isFinite(i.qty) || i.qty <= 0) e.qty = "Enter a quantity greater than 0.";
  else if (i.qty > 100) e.qty = "Demo limit is 100 quintals per booking.";
  if (!c) e.centreId = "Select a procurement centre.";
  else if (!c.open) e.centreId = "This centre is closed. Choose another centre.";
  else if (i.crop && !c.crops.includes(i.crop)) e.centreId = `${c.name} does not procure ${i.crop}.`;
  if (!i.date || !BOOKABLE_DATES.includes(i.date)) e.date = "Select an available date.";
  if (i.slot === undefined || !SLOT_TIMES.includes(i.slot)) e.slot = "Select a time slot.";
  else if (c && i.date && slotInfo(s, c.id, i.date, i.slot).left <= 0) e.slot = "This slot is full. Choose another slot.";
  if (!e.crop && i.date && s.bookings.some((b) => b.crop === i.crop && b.date === i.date && b.status !== "Cancelled" && b.status !== "Completed"))
    e.form = `You already have an active ${i.crop} booking on ${fmtDate(i.date)}. Cancel it first to rebook.`;
  return e;
}

function newId(s: State) {
  let id = "";
  do id = `PRC-HR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  while (s.bookings.some((b) => b.id === id));
  return id;
}

export function createBooking(i: BookInput): { ok: true; id: string } | { ok: false; errors: Record<string, string> } {
  load();
  const errors = validateBooking(state, i);
  if (Object.keys(errors).length) return { ok: false, errors };
  const id = newId(state);
  const at = nowIso();
  const c = getCentre(i.centreId)!;
  const b: Booking = { ...i, id, status: "Booked", paymentStatus: "Pending", createdAt: at, history: [{ status: "Booked", at, by: "Farmer" }] };
  set({ ...state, bookings: [b, ...state.bookings],
    notices: [notice({ type: "success", title: "Booking confirmed (demo)", body: `${id} · ${i.crop} ${i.qty} qtl · ${fmtDate(i.date)}, ${fmtTime(i.slot)} at ${c.name}.` }), ...state.notices] });
  return { ok: true, id };
}

export const canCancel = (b: Booking) => b.status === "Booked";
export function cancelBooking(id: string) {
  load();
  const b = state.bookings.find((x) => x.id === id);
  if (!b || !canCancel(b)) return false;
  const at = nowIso();
  set({ ...state,
    bookings: state.bookings.map((x) => x.id === id ? { ...x, status: "Cancelled" as Status, history: [...x.history, { status: "Cancelled" as Status, at, by: "Farmer" }] } : x),
    notices: [notice({ type: "info", title: "Booking cancelled", body: `${id} was cancelled. The demo slot has been released.` }), ...state.notices] });
  return true;
}

export function nextStatus(b: Booking): Status | null {
  const i = FLOW.indexOf(b.status);
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1]! : null;
}
export function advanceStatus(id: string) {
  load();
  const b = state.bookings.find((x) => x.id === id);
  const to = b && nextStatus(b);
  if (!b || !to) return false;
  const at = nowIso();
  set({ ...state,
    bookings: state.bookings.map((x) => x.id === id ? { ...x, status: to, paymentStatus: to === "Completed" ? "Processing" : x.paymentStatus, history: [...x.history, { status: to, at, by: "Demo operator" }] } : x),
    notices: [notice({ type: to === "Completed" ? "success" : "info", title: `Status updated: ${to} (demo)`, body: `${id} was marked "${to}" by the demo centre operator.${to === "Completed" ? " Illustrative payment status is now Processing." : ""}` }), ...state.notices] });
  return true;
}
export function markPaid(id: string) {
  load();
  const b = state.bookings.find((x) => x.id === id);
  if (!b || b.status !== "Completed" || b.paymentStatus !== "Processing") return false;
  set({ ...state,
    bookings: state.bookings.map((x) => x.id === id ? { ...x, paymentStatus: "Paid" as PayStatus } : x),
    notices: [notice({ type: "success", title: "Payment marked Paid (illustrative)", body: `Demo payment for ${id} is marked Paid. No real money is transferred by this demo.` }), ...state.notices] });
  return true;
}

export function markRead(id: string) { load(); set({ ...state, notices: state.notices.map((n) => n.id === id ? { ...n, read: true } : n) }); }
export function markAllRead() { load(); set({ ...state, notices: state.notices.map((n) => ({ ...n, read: true })) }); }
export function clearNotices() { load(); set({ ...state, notices: [] }); }
export function setSelectedCentre(id: string | undefined) {
  load();
  const ok = id && getCentre(id)?.open ? id : undefined;
  if (ok !== state.selectedCentreId) set({ ...state, selectedCentreId: ok });
}

/** Resolve a consistent crop/centre/date/slot draft: drops a centre that is unknown, closed or
 * doesn't procure the crop, and drops a slot that doesn't exist or is full. */
export function resolveDraft(s: State, d: { centre?: string; crop?: string; date?: string; slot?: number }) {
  const c = d.centre ? getCentre(d.centre) : undefined;
  const centre = c && c.open ? c : undefined;
  // Explicit crop wins; otherwise use the farmer's saved preference only when it is valid
  // (and supported by the chosen centre). Never auto-pick a crop the farmer didn't choose.
  let crop = d.crop && getCrop(d.crop) ? d.crop : "";
  if (!crop) {
    const pref = s.profile.preferredCrop;
    crop = pref && getCrop(pref) && (!centre || centre.crops.includes(pref)) ? pref : "";
  }
  const centreId = centre && (!crop || centre.crops.includes(crop)) ? centre.id : "";
  const date = d.date && BOOKABLE_DATES.includes(d.date) ? d.date : "";
  const slot = centreId && date && d.slot !== undefined && SLOT_TIMES.includes(d.slot) && slotInfo(s, centreId, date, d.slot).left > 0 ? d.slot : undefined;
  return { crop, centreId, date, slot: crop ? slot : undefined, dropped: !!d.centre && !centreId };
}

/* ---------------- Documents (per user, status only; files are never stored) ---------------- */
export type DocRow = { name: string; status: string; tone: "success" | "warning" | "danger" | "info"; updated: string };
export function docRows(s: State): DocRow[] {
  return baseDocs.map((d) => {
    const up = s.docUploads?.[d.name];
    if (up) return { name: d.name, status: "Pending review", tone: "warning" as const, updated: fmtStamp(up) };
    return s.uid === DEMO_UID ? { ...d } : { name: d.name, status: "Missing", tone: "danger" as const, updated: "—" };
  });
}
export function markDocUploaded(name: string) { load(); set({ ...state, docUploads: { ...(state.docUploads ?? {}), [name]: nowIso() } }); }

export function updateProfile(p: Profile) { load(); set({ ...state, profile: p }); }
export function resetDemo() {
  load();
  if (!sessionUid) return;
  if (sessionUid === DEMO_UID) return set(seed());
  const a = getAccounts().find((x) => x.id === sessionUid);
  if (a) set(seedNewUser(a));
}

/* ---------------- Crops (per user) ---------------- */

export type CropInput = { crop: string; variety: string; areaAcres: number; season: string; expectedQtl: number };
export function validateCrop(i: Partial<CropInput>, existing: CropEntry[], editingId?: string): Record<string, string> {
  const e: Record<string, string> = {};
  if (!i.crop || !getCrop(i.crop)) e.crop = "Select a crop.";
  if (!i.variety?.trim()) e.variety = "Enter the variety.";
  else if (i.variety.trim().length > 40) e.variety = "Keep variety under 40 characters.";
  if (!i.areaAcres || !Number.isFinite(i.areaAcres) || i.areaAcres <= 0) e.areaAcres = "Enter area greater than 0.";
  else if (i.areaAcres > 200) e.areaAcres = "Demo limit is 200 acres.";
  if (!i.season) e.season = "Select a season.";
  if (!i.expectedQtl || !Number.isFinite(i.expectedQtl) || i.expectedQtl <= 0) e.expectedQtl = "Enter expected yield greater than 0.";
  else if (i.expectedQtl > 5000) e.expectedQtl = "Demo limit is 5000 quintals.";
  if (!e.crop && !e.season && existing.some((c) => c.id !== editingId && c.crop === i.crop && c.season === i.season))
    e.crop = `${i.crop} for ${i.season} is already in your list. Edit it instead.`;
  return e;
}
export function saveCrop(i: CropInput, editingId?: string): { ok: true } | { ok: false; errors: Record<string, string> } {
  load();
  if (!sessionUid) return { ok: false, errors: { form: "Sign in to add crops." } };
  const errors = validateCrop(i, state.crops, editingId);
  if (Object.keys(errors).length) return { ok: false, errors };
  const clean = { ...i, variety: i.variety.trim() };
  const crops = editingId
    ? state.crops.map((c) => (c.id === editingId ? { ...c, ...clean } : c))
    : [...state.crops, { id: `crop-${rid()}`, ...clean }];
  const cropPrefs = Array.from(new Set([...state.profile.cropPrefs, i.crop]));
  set({ ...state, crops, profile: { ...state.profile, cropPrefs } });
  return { ok: true };
}
export function deleteCrop(id: string) { load(); set({ ...state, crops: state.crops.filter((c) => c.id !== id) }); }

/* ---------------- Derived helpers ---------------- */

export const amountOf = (b: Booking) => b.qty * (getCrop(b.crop)?.msp ?? 0);
export const isActive = (b: Booking) => b.status !== "Cancelled" && b.status !== "Completed";
export function upcoming(s: State) {
  return s.bookings.filter(isActive).sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot) || a.slot - b.slot)[0];
}
