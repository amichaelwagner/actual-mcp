import type { Transaction } from '../../core/types/domain.js';

/**
 * Filters transactions by a case-insensitive category-name substring, looking inside splits.
 *
 * A split parent is kept when any of its subtransactions match, and its subtransactions are
 * narrowed to the matching pieces so the report shows only the relevant split legs.
 *
 * @param transactions - Enriched transactions (with `category_name`, possibly with `subtransactions`)
 * @param categoryName - Category name, or part of one, to match
 * @returns The matching transactions
 */
export function filterByCategoryName(transactions: Transaction[], categoryName: string): Transaction[] {
  const needle = categoryName.toLowerCase();
  const matches = (t: Transaction): boolean => (t.category_name || '').toLowerCase().includes(needle);

  return transactions.flatMap((t) => {
    if (matches(t)) return [t];
    // Reason: split parents carry no category of their own; the categories live on the children.
    const subMatches = (t.subtransactions ?? []).filter(matches);
    return subMatches.length ? [{ ...t, subtransactions: subMatches }] : [];
  });
}
