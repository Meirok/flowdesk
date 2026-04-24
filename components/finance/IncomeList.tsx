import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { Income, IncomeStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { formatARS } from '../../lib/utils/formatCurrency';
import { formatDate } from '../../lib/utils/dates';

const statusVariant = (s: IncomeStatus) => {
  if (s === 'Pagado') return 'success';
  if (s === 'Pendiente') return 'warning';
  return 'info';
};

interface IncomeListProps {
  income: Income[];
  onDelete: (id: string) => void;
}

export function IncomeList({ income, onDelete }: IncomeListProps) {
  if (income.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin ingresos este mes</Text>
        <Text style={styles.emptyHint}>Presiona + para agregar un ingreso</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={income}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
            {item.client ? (
              <Text style={styles.client}>{item.client.name}</Text>
            ) : null}
            <Text style={styles.date}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.amount}>{formatARS(item.amount)}</Text>
            <Badge label={item.status} variant={statusVariant(item.status)} />
            <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={8} style={styles.deleteBtn}>
              <Trash2 size={14} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  itemLeft: { flex: 1, gap: 3 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  description: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  client: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  amount: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.success,
  },
  deleteBtn: { padding: 2, marginTop: 4 },
  separator: { height: spacing.sm },
  empty: { alignItems: 'center', paddingVertical: spacing.xl * 2, gap: spacing.sm },
  emptyText: { fontFamily: fonts.medium, fontSize: 16, color: colors.textMuted },
  emptyHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});
