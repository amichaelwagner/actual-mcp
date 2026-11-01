// Groups transactions by category and aggregates spending
import type { Transaction, CategorySpending, CategoryGroupInfo } from '../types/domain.js';

export class TransactionGrouper {
  groupByCategory(
    transactions: Transaction[],
    getCategoryName: (categoryId: string) => string,
    getGroupInfo: (categoryId: string) => CategoryGroupInfo | undefined,
    includeIncome: boolean
  ): Record<string, CategorySpending> {
    const spendingByCategory: Record<string, CategorySpending> = {};
    // Reason: Actual returns a split as an uncategorized parent with categorized `subtransactions`.
    // Counting the children (instead of the parent) attributes each split piece to its own category;
    // ordinary transactions arrive with an empty `subtransactions` array, so test its length.
    const flattened = transactions.flatMap((transaction) =>
      transaction.subtransactions?.length ? transaction.subtransactions : [transaction]
    );
    flattened.forEach((transaction) => {
      if (!transaction.category) return; // Skip uncategorized
      const categoryId = transaction.category;
      const categoryName = getCategoryName(categoryId);
      const group = getGroupInfo(categoryId) || {
        name: 'Unknown Group',
        isIncome: false,
      };
      // Skip income categories if not requested
      if (group.isIncome && !includeIncome) return;
      if (!spendingByCategory[categoryId]) {
        spendingByCategory[categoryId] = {
          id: categoryId,
          name: categoryName,
          group: group.name,
          isIncome: group.isIncome,
          total: 0,
          transactions: 0,
        };
      }
      spendingByCategory[categoryId].total += transaction.amount;
      spendingByCategory[categoryId].transactions += 1;
    });
    return spendingByCategory;
  }
}
