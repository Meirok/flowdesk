import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2, CreditCard, Banknote, ArrowRightLeft, Smartphone } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { Badge } from '../ui/Badge';
import { formatARS } from '../../lib/utils/formatCurrency';
import { formatDate } from '../../lib/utils/dates';

const categoryColor: Record<ExpenseCategory, string> = {
  Servicios: colors.accent,
  Equipamiento: colors.purple,
  Software: '#14b8a6',
  Impuestos: colors.danger,
  Marketing: '#f97316',
  Varios: colors.textMuted,
};

const PaymentIcon = ({ method }: { method: PaymentMethod }) => {
  const size = 14;
  const clr = colors.textMuted;
  if (method === 'Crédito') return <CreditCard size={size} color={clr} />;
  if (method === 'Débito') return <Smartphone size={size} color={clr} />;
  if (method === 'Transferencia') return <ArrowRightLeft size={size} color={clr} />;
  return <Banknote size={size} color={clr} />;
};

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin gastos este mes</Text>
        <Text style={styles.emptyHint}>Presiona + para agregar un gasto</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={expenses}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={[styles.categoryAccent, { backgroundColor: categoryColor[item.category] }]} />
          <View style={styles.itemBody}>
            <View style={styles.itemLeft}>
              <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
              <View style={styles.metaRow}>
                <Badge label={item.category} color={categoryColor[item.category]} />
                <View style={styles.payRow}>
                  <PaymentIcon method={item.payment_method} />
                  <Text style={styles.payText}>{item.payment_method}</Text>
                </View>
              </View>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.amount}>{formatARS(item.amount)}</Text>
              <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={8}>
                <Trash2 size={14} color={colors.danger} />
              </TouchableOpacity>
            </View>
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  categoryAccent: {
    width: 4,
  },
  itemBody: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm + 4,
    gap: spacing.sm,
  },
  itemLeft: { flex: 1, gap: 4 },
  itemRight: { alignItems: 'flex-end', gap: spacing.sm },
  description: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  payText: {
    fontFamily: fonts.regular,
    fontSize: 11,
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
    color: colors.danger,
  },
  separator: { height: spacing.sm },
  empty: { alignItems: 'center', paddingVertical: spacing.xl * 2, gap: spacing.sm },
  emptyText: { fontFamily: fonts.medium, fontSize: 16, color: colors.textMuted },
  emptyHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});
