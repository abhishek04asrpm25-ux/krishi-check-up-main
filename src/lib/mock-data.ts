// Demo data only — no real integrations.
export const farmer = {
  name: "Ramesh Kumar Yadav",
  initials: "RY",
  id: "KC-FRM-2026-04821",
  mobile: "+91 98765 43210",
  email: "ramesh.yadav@example.in",
  dob: "12 Mar 1978",
  gender: "Male",
  aadhaarMasked: "XXXX XXXX 4821",
  village: "Khanpur Kalan",
  block: "Gohana",
  district: "Panipat",
  state: "Haryana",
  pincode: "131301",
  category: "Small farmer",
  language: "Hindi",
};

export const nextProcurement = {
  id: "PRC-HR-2026-118734",
  crop: "Wheat (HD-2967)",
  quantity: "42 quintals",
  centre: "Gohana Grain Market — Centre 3",
  date: "Sat, 10 Oct 2026",
  time: "10:30 AM",
  slot: "Token #47",
  centreStatus: "Moderate crowd",
  waiting: "45 min",
  departure: "8:45 AM",
  travel: "40 min",
  processing: "1 hr 15 min",
  completion: "1:15 PM",
  distance: "18 km",
};

export const centres = [
  { name: "Gohana Grain Market — Centre 3", distance: "18 km", status: "Moderate", tone: "warning", wait: "45 min", hours: "8:00 AM – 6:00 PM", crops: ["Wheat", "Mustard"], capacity: 68, address: "Old Sonipat Rd, Gohana" },
  { name: "Sonipat Anaj Mandi", distance: "26 km", status: "Low crowd", tone: "success", wait: "15 min", hours: "8:00 AM – 5:00 PM", crops: ["Wheat", "Paddy"], capacity: 32, address: "Sector 14, Sonipat" },
  { name: "Kharkhoda Procurement Yard", distance: "34 km", status: "Busy", tone: "danger", wait: "2 hr 10 min", hours: "9:00 AM – 6:00 PM", crops: ["Wheat"], capacity: 91, address: "Rohtak Rd, Kharkhoda" },
  { name: "Ganaur Purchase Centre", distance: "41 km", status: "Low crowd", tone: "success", wait: "20 min", hours: "8:30 AM – 5:30 PM", crops: ["Wheat", "Barley", "Gram"], capacity: 40, address: "GT Road, Ganaur" },
  { name: "Rai Cooperative Centre", distance: "47 km", status: "Closed today", tone: "neutral", wait: "—", hours: "Opens Mon 8:00 AM", crops: ["Paddy"], capacity: 0, address: "Rai Industrial Area" },
] as const;

export const procurementSteps = [
  { title: "Application submitted", time: "02 Oct, 11:20 AM", detail: "Application PRC-HR-2026-118734 received", state: "done" },
  { title: "Documents verified", time: "04 Oct, 3:05 PM", detail: "Land record and bank details verified", state: "done" },
  { title: "Appointment scheduled", time: "06 Oct, 9:40 AM", detail: "Sat 10 Oct, 10:30 AM · Token #47", state: "done" },
  { title: "Arrival & gate entry", detail: "Show your token QR at the gate", state: "current" },
  { title: "Quality check & weighing", detail: "Moisture and quality inspection", state: "upcoming" },
  { title: "Procurement completed", detail: "J-Form / purchase receipt issued", state: "upcoming" },
  { title: "Payment credited", detail: "Usually within 72 hours", state: "upcoming" },
] as const;

export const applications = [
  { id: "PRC-HR-2026-118734", crop: "Wheat", qty: "42 qtl", date: "10 Oct 2026", status: "Scheduled", tone: "info" },
  { id: "PRC-HR-2026-097112", crop: "Mustard", qty: "12 qtl", date: "21 Apr 2026", status: "Completed", tone: "success" },
  { id: "PRC-HR-2025-310455", crop: "Paddy", qty: "55 qtl", date: "18 Oct 2025", status: "Completed", tone: "success" },
] as const;

export const payments = [
  { id: "PAY-778213", procurement: "PRC-HR-2026-118734", crop: "Wheat · 42 qtl", amount: "₹1,02,900", date: "Expected by 13 Oct", status: "Pending", tone: "warning" },
  { id: "PAY-661029", procurement: "PRC-HR-2026-097112", crop: "Mustard · 12 qtl", amount: "₹68,400", date: "24 Apr 2026", status: "Credited", tone: "success" },
  { id: "PAY-540877", procurement: "PRC-HR-2025-310455", crop: "Paddy · 55 qtl", amount: "₹1,27,600", date: "22 Oct 2025", status: "Credited", tone: "success" },
] as const;

export const documents = [
  { name: "Aadhaar card", status: "Verified", tone: "success", updated: "12 Jan 2026" },
  { name: "Land record (Jamabandi)", status: "Verified", tone: "success", updated: "02 Feb 2026" },
  { name: "Bank passbook / cancelled cheque", status: "Verified", tone: "success", updated: "02 Feb 2026" },
  { name: "Crop sowing declaration", status: "Under review", tone: "info", updated: "03 Oct 2026" },
  { name: "Passport-size photograph", status: "Missing", tone: "danger", updated: "—" },
] as const;

export const notifications = [
  { title: "Leave by 8:45 AM tomorrow", body: "Moderate crowd expected at Gohana Centre 3. Estimated wait 45 min.", time: "2 hours ago", type: "warning", read: false },
  { title: "Appointment confirmed", body: "Sat 10 Oct, 10:30 AM · Token #47 for 42 qtl wheat.", time: "Yesterday", type: "success", read: false },
  { title: "Upload passport photograph", body: "One document is missing from your profile.", time: "2 days ago", type: "danger", read: false },
  { title: "Documents verified", body: "Your land record and bank details have been verified.", time: "4 Oct", type: "info", read: true },
  { title: "Mustard payment credited", body: "₹68,400 credited to SBI account ending 3391.", time: "24 Apr", type: "success", read: true },
] as const;

export const crops = [
  { crop: "Wheat", variety: "HD-2967", area: "3.5 acres", season: "Rabi 2025–26", expected: "42 qtl", msp: "₹2,450 / qtl" },
  { crop: "Mustard", variety: "Pusa Bold", area: "1.0 acre", season: "Rabi 2025–26", expected: "12 qtl", msp: "₹5,950 / qtl" },
  { crop: "Paddy", variety: "PR-126", area: "4.0 acres", season: "Kharif 2026", expected: "55 qtl", msp: "₹2,320 / qtl" },
];

export const bank = {
  holder: "Ramesh Kumar Yadav",
  bank: "State Bank of India",
  branch: "Gohana Main Branch",
  account: "XXXX XXXX 3391",
  ifsc: "SBIN0001234",
  type: "Savings",
  status: "Verified",
};
