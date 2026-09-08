/**
 * Bangladeshi mobile numbers, as the courier wants them: 11 digits starting
 * with 01, i.e. 01XXXXXXXXX. Customers type them with or without +880 and
 * with stray spaces or dashes, so normalise before judging.
 */

// Operator prefixes in use: 013–019 (Grameenphone, Banglalink, Robi, Airtel,
// Teletalk). 010–012 are not mobile numbers.
const BD_MOBILE = /^01[3-9]\d{8}$/;

/** The 11-digit form of a Bangladeshi mobile number, or null if it isn't one. */
export function toBdMobile(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(3);
  if (digits.length === 10 && digits.startsWith("1")) digits = `0${digits}`;
  return BD_MOBILE.test(digits) ? digits : null;
}

/** Keep only what a phone number can contain while the customer types. */
export function cleanPhoneInput(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, "");
  // A plus only makes sense at the very start.
  return cleaned[0] === "+" ? `+${cleaned.slice(1).replace(/\+/g, "")}` : cleaned.replace(/\+/g, "");
}
