import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useFinances } from '../../lib/hooks/useFinances';
import { SummaryCards } from '../../components/finance/SummaryCards';
import { IncomeList } from '../../components/finance/IncomeList';
import { ExpenseList } from '../../components/finance/ExpenseList';
import { CreditCardTracker } from '../../components/finance/CreditCardTracker';
import AddIncomeModal from '../modals/add-income';
import AddExpenseModal from '../modals/add-expense';
import { colors, fonts, radius, spacing } from '../../constants/theme';

const TABS = ['Resumen', 'Ingresos', 'Gastos', 'Tarjetas'] as const;
type TabName = typeof TABS[number];

export default function FinancesScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>('Resumen');
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const {
    income,
    expenses,
    cards,
    monthlyTotals,
    barData,
    categoryTotals,
    loading,
    fetchIncome,
    fetchExpenses,
    fetchMonthlyTotals,
    fetchBarData,
    fetchCards,
    deleteIncome,
    deleteExpense,
  } = useFinances();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    fetchMonthlyTotals(month, year);
    fetchBarData();
  }, []);

  useEffect(() => {
    if (activeTab === 'Ingresos') fetchIncome(month, year);
    if (activeTab === 'Gastos') fetchExpenses(month, year);
    if (activeTab === 'Tarjetas') fetchCards();
  }, [activeTab]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }

    switch (activeTab) {
      case 'Resumen':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <SummaryCards totals={monthlyTotals} />
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Últimos 6 meses</Text>
              {barData.length > 0 ? (
                <View style={styles.barChart}>
                  {barData.map((d, i) => {
                    const max = Math.max(...barData.map(x => Math.max(x.income, x.expenses)), 1);
                    return (
                      <View key={i} style={styles.barGroup}>
                        <View style={styles.bars}>
                          <View style={[styles.bar, { height: (d.income / max) * 80, backgroundColor: colors.success }]} />
                          <View style={[styles.bar, { height: (d.expenses / max) * 80, backgroundColor: colors.danger }]} />
                        </View>
                        <Text style={styles.barLabel}>{d.month}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.noData}>Sin datos disponibles</Text>
              )}
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.legendText}>Ingresos</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                  <Text style={styles.legendText}>Gastos</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );

      case 'Ingresos':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            <IncomeList income={income} onDelete={deleteIncome} />
          </ScrollView>
        );

      case 'Gastos':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {categoryTotals.length > 0 && (
              <View style={styles.donutSection}>
                <Text style={styles.sectionTitle}>Por categoría</Text>
                {categoryTotals.map((ct) => {
                  const total = categoryTotals.reduce((s, x) => s + x.total, 0);
                  const pct = total > 0 ? Math.round((ct.total / total) * 100) : 0;
                  return (
                    <View key={ct.category} style={styles.categoryRow}>
                      <Text style={styles.categoryName}>{ct.category}</Text>
                      <View style={styles.categoryBar}>
                        <View style={[styles.categoryBarFill, { width: `${pct}%`, backgroundColor: colors.accent }]} />
                      </View>
                      <Text style={styles.categoryPct}>{pct}%</Text>
                    </View>
                  );
                })}
              </View>
            )}
            <ExpenseList expenses={expenses} onDelete={deleteExpense} />
          </ScrollView>
        );

      case 'Tarjetas':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            <CreditCardTracker cards={cards} />
          </ScrollView>
        );
    }
  };

  const showFab = activeTab === 'Ingresos' || activeTab === 'Gastos' || activeTab === 'Tarjetas';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Finanzas</Text>
      </View>

      <View style={styles.segmentedControl}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>{renderContent()}</View>

      {showFab && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 80 }]}
          onPress={() => {
            if (activeTab === 'Ingresos') setShowAddIncome(true);
            else if (activeTab === 'Gastos') setShowAddExpense(true);
            else if (activeTab === 'Tarjetas') setShowAddExpense(true);
          }}
        >
          <Plus size={24} color={colors.bg} />
        </TouchableOpacity>
      )}

      <AddIncomeModal
        visible={showAddIncome}
        onClose={() => { setShowAddIncome(false); fetchIncome(month, year); fetchMonthlyTotals(month, year); }}
      />
      <AddExpenseModal
        visible={showAddExpense}
        onClose={() => { setShowAddExpense(false); fetchExpenses(month, year); fetchMonthlyTotals(month, year); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.accent,
  },
  tabBtnText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  tabBtnTextActive: {
    color: colors.bg,
    fontFamily: fonts.bold,
  },
  content: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl * 3,
    gap: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  chartSection: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 100,
    gap: 4,
  },
  barGroup: { alignItems: 'center', gap: 4 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 14, borderRadius: 3, minHeight: 2 },
  barLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
  noData: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  donutSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryName: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    width: 80,
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: { height: '100%', borderRadius: 4 },
  categoryPct: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    width: 32,
    textAlign: 'right',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
