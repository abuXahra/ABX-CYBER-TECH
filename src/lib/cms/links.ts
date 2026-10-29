import { z } from "zod";

const INTERNAL = /^\/(?!\/)[A-Za-z0-9\-._~/#?=&%+]*$/;
const MAILTO = /^mailto:[^\s<>"']+@[^\s<>"']+$/i;
const TEL = /^tel:\+?[0-9\-\s()]{5,20}$/i;

/** Allow-list of link destinations. Everything else (javascript:, data:, //host, …) is rejected. */
export function isSafeHref(value: string): boolean {
  if (value !== value.trim()) return false;
  if (INTERNAL.test(value) || MAILTO.test(value) || TEL.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
}

export const safeHref = z
  .string()
  .max(500)
  .refine(isSafeHref, "Use an internal path (/about), https:// URL, mailto: or tel: link");

export const optionalSafeHref = z.union([z.literal(""), safeHref]);
