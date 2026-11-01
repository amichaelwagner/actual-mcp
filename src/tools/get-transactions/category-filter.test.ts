import { describe, it, expect } from 'vitest';
import { filterByCategoryName } from './category-filter.js';
import type { Transaction } from '../../core/types/domain.js';

const tx = (over: Partial<Transaction>): Transaction =>
  ({ id: 'x', account: 'a', date: '2026-10-30', amount: -100, ...over }) as Transaction;

describe('filterByCategoryName', () => {
  it('keeps plain transactions whose category matches, case-insensitively', () => {
    const list = [tx({ id: '1', category_name: 'Groceries' }), tx({ id: '2', category_name: 'Dining' })];
    expect(filterByCategoryName(list, 'grocer').map((t) => t.id)).toEqual(['1']);
  });

  it('keeps a split parent when a piece matches and narrows its pieces to the matches', () => {
    const split = tx({
      id: 'p',
      amount: -6245,
      subtransactions: [
        tx({ id: 'c1', amount: -3000, category_name: 'Protein' }),
        tx({ id: 'c2', amount: -3245, category_name: 'Groceries' }),
      ],
    });
    const out = filterByCategoryName([split], 'Protein');
    expect(out).toHaveLength(1);
    expect(out[0].subtransactions?.map((s) => s.id)).toEqual(['c1']);
    expect(split.subtransactions).toHaveLength(2); // input not mutated
  });

  it('drops transactions with no category and no matching pieces', () => {
    const list = [tx({ id: '1' }), tx({ id: '2', subtransactions: [tx({ id: 'c', category_name: 'Dining' })] })];
    expect(filterByCategoryName(list, 'Protein')).toEqual([]);
  });
});
