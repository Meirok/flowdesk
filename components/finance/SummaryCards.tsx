import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrendingUp, TrendingDown, Scale, Clock } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { MonthlyTotals } from '../../types';
import { formatARS } from '../../lib/utils/formatCurrency';

interface SummaryCardsProps {
  totals: MonthlyTotals;
}

export function SummaryCards({ totals }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Ingresos del mes',
      value: formatARS(totals.totalIncome),
      icon: TrendingUp,
      color: colors.success,
    },
    {
      label: 'Gastos del mes',
      value: formatARS(totals.totalExpenses),
      icon: TrendingDown,
      color: colors.danger,
    },
    {
      label: 'Balance neto',
      value: formatARS(totals.balance),
      icon: Scale,
      color: totals.balance >= 0 ? colors.success : colors.danger,
    },
    {
      label: 'Cobros pendientes',
      value: formatARS(totals.pendingCobros),
      icon: Clock,
      color: colors.warning,
    },
  ];

  return (
    <View style={styles.grid}>
      {cards.map(({ label, value, icon: Icon, color }) => (
        <View key={label} style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
            <Icon size={18} color={color} />
          </View>
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 18,
    marginTop: 4,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
