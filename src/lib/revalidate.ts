import { revalidatePath } from "next/cache";
import { locales, localePath } from "@/lib/i18n/config";

/** Refresh the statically generated public pages (/ar, /en) after an admin content change. */
export function revalidateSite(): void {
  for (const locale of locales) revalidatePath(localePath(locale));
}
