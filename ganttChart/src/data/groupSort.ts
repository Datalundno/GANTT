"use strict";

export type GroupSort = "data" | "az" | "za";

const collators = new Map<string, Intl.Collator>();

export function parseGroupSort(value: unknown): GroupSort {
    if (value === "data" || value === "az" || value === "za") {
        return value;
    }
    return "data";
}

function collatorFor(locale: string | undefined): Intl.Collator {
    const key = locale && locale.trim() ? locale : "en";
    let collator = collators.get(key);
    if (!collator) {
        try {
            collator = new Intl.Collator(key, { numeric: true, sensitivity: "base" });
        } catch {
            collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
        }
        collators.set(key, collator);
    }
    return collator;
}

/** Numeric natural order so DA2 stays before DA10. Letter order follows the report locale. */
export function naturalCompare(a: string, b: string, locale?: string): number {
    return collatorFor(locale).compare(a, b);
}

/**
 * Sort group keys. Data order is first appearance.
 * `pinnedKey` (the Ungrouped bucket) stays at its first-appearance index.
 */
export function sortGroupKeys(
    order: readonly string[],
    mode: GroupSort,
    locale?: string,
    pinnedKey?: string
): string[] {
    if (mode === "data") {
        return order.slice();
    }
    const pinnedIndex = pinnedKey == null ? -1 : order.indexOf(pinnedKey);
    const named = pinnedIndex < 0 ? order.slice() : order.filter((key) => key !== pinnedKey);
    const direction = mode === "za" ? -1 : 1;
    named.sort((a, b) => naturalCompare(a, b, locale) * direction);
    if (pinnedIndex < 0 || pinnedKey == null) {
        return named;
    }
    named.splice(Math.min(pinnedIndex, named.length), 0, pinnedKey);
    return named;
}
