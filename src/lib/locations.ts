// Shared demo location dataset — 10 Indian states, 4 districts each.
// Used by registration, profile, centre search and booking forms.
export const STATES_DISTRICTS: Record<string, string[]> = {
  "Uttar Pradesh": ["Lucknow", "Kanpur Nagar", "Varanasi", "Agra"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  Haryana: ["Karnal", "Hisar", "Rohtak", "Panipat"],
  Punjab: ["Ludhiana", "Amritsar", "Patiala", "Bathinda"],
  Rajasthan: ["Jaipur", "Jodhpur", "Kota", "Ajmer"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior"],
  Maharashtra: ["Pune", "Nashik", "Nagpur", "Kolhapur"],
  "West Bengal": ["Kolkata", "Nadia", "Hooghly", "Murshidabad"],
  Gujarat: ["Ahmedabad", "Surat", "Rajkot", "Vadodara"],
  Delhi: ["Central Delhi", "North Delhi", "South Delhi", "West Delhi"],
};

export const STATES = Object.keys(STATES_DISTRICTS);

export const districtsOf = (state: string): string[] => STATES_DISTRICTS[state] ?? [];
