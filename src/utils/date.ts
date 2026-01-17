/**
 * Takes a date as a string and returns a formatted date string based on the passed locale.
 * @param dateString A date string
 * @param locale The locale to format the date string (e.g. "en", "no", ...)
 * @returns A formatted date string
 */
export function formatDateAndTime(
    date: string | Date,
    locale: string,
    dateStyle: "short" | "medium" | "long" | "full" = "short",
    includeTime = false
): string {
    const options: Record<string, string> = { dateStyle };
    if (includeTime) {
        options.timeStyle = "short";
    }
    try {
        return new Intl.DateTimeFormat(locale, options).format(typeof date === "string" ? new Date(date) : date);
    } catch {
        return "";
    }
}

export function endOfDay(date: string) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
