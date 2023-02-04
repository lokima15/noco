import { NcUpgraderCtx } from './NcUpgrader';
import { MetaTable } from '../utils/globals';
import Column from '../models/Column';
import Filter from '../models/Filter';
import { UITypes } from 'nocodb-sdk';

// as of 0.104.3, almost all filter operators are available to all column types
// while some of them aren't supposed to be shown
// this upgrader is to remove those unsupported filters / migrate to the correct filter
// changes:
// - remove `>`, `<`, `>=`, `<=` for text-based columns
// - remove `like`, `null`, and `empty` for numeric-based columns - migrate to `blank` from `null` and `empty`

export default async function ({ ncMeta }: NcUpgraderCtx) {
  const filters = await ncMeta.metaList2(null, null, MetaTable.FILTER_EXP);
  const actions = [];
  for (const filter of filters) {
    const col = await Column.get({ colId: filter.fk_column_id }, ncMeta);
    if (!col || !col.uidt) {
      // column not found -> skip
      continue;
    }
    if (
      [
        UITypes.SingleLineText,
        UITypes.LongText,
        UITypes.PhoneNumber,
        UITypes.Email,
        UITypes.URL,
      ].includes(col.uidt)
    ) {
      // remove `>`, `<`, `>=`, `<=` for text-based columns
      if (['gt', 'lt', 'gte', 'lte'].includes(filter.comparison_op)) {
        actions.push(await Filter.delete(filter, ncMeta));
      }
    } else if (
      [
        UITypes.Duration,
        UITypes.Currency,
        UITypes.Percent,
        UITypes.Number,
        UITypes.Decimal,
        UITypes.Rating,
        UITypes.Rollup,
      ].includes(col.uidt)
    ) {
      if (['like', 'nlike'].includes(filter.comparison_op)) {
        // remove `is like`, `is not like`
        actions.push(await Filter.delete(filter, ncMeta));
      } else if (
        ['null', 'notnull', 'empty', 'notempty'].includes(filter.comparison_op)
      ) {
        // remove `is null`, `is not null`, `is empty`, `is not empty`
        actions.push(await Filter.delete(filter, ncMeta));
        // TODO: migrate to blank / not blank
      }
    }
  }
  await Promise.all(actions);
}
