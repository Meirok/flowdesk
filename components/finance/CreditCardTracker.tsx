import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { CreditCard } from '../../types';
import { formatARS } from '../../lib/utils/formatCurrency';
import { formatDate } from '../../lib/utils/dates';

interface CreditCardTrackerProps {
  cards: CreditCard[];
}

function CardItem({ card }: { card: CreditCard }) {
  const [expanded, setExpanded] = useState(false);
  const isUrgent = (card.days_until_due ?? 99) <= 7;

  return (
    <View style={[styles.card, isUrgent && styles.cardUrgent]}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.cardHeader}
        activeOpacity={0.8}
      >
        <View style={styles.cardLeft}>
          <View style={styles.cardTitleRow}>
            {isUrgent && <AlertTriangle size={14} color={colors.danger} />}
            <Text style={styles.cardName}>{card.name}</Text>
          </View>
          <Text style={styles.cardBank}>{card.bank}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.cardAmount, isUrgent && { color: colors.danger }]}>
            {formatARS(card.total_month ?? 0)}
          </Text>
          <Text style={styles.daysText}>
            {card.days_until_due !== undefined ? `${card.days_until_due}d para vencer` : ''}
          </Text>
          {expanded ? (
            <ChevronUp size={16} color={colors.textMuted} />
          ) : (
            <ChevronDown size={16} color={colors.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Cierre día {card.closing_day}</Text>
        <Text style={styles.infoText}>Vence día {card.due_day}</Text>
      </View>

      {expanded && card.purchases && card.purchases.length > 0 && (
        <View style={styles.purchasesList}>
          <View style={styles.purchaseSeparator} />
          {card.purchases.map((p) => (
            <View key={p.id} style={styles.purchaseRow}>
              <View style={styles.purchaseLeft}>
                <Text style={styles.merchant}>{p.merchant}</Text>
                <Text style={styles.purchaseDate}>{formatDate(p.date)}</Text>
                {p.installments > 1 && (
                  <Text style={styles.installments}>{p.installments} cuotas</Text>
                )}
              </View>
              <Text style={styles.purchaseAmount}>{formatARS(p.amount)}</Text>
            </View>
          ))}
        </View>
      )}

      {expanded && (!card.purchases || card.purchases.length === 0) && (
        <View style={styles.noPurchases}>
          <Text style={styles.noPurchasesText}>Sin compras este mes</Text>
        </View>
      )}
    </View>
  );
}

export function CreditCardTracker({ cards }: CreditCardTrackerProps) {
  if (cards.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin tarjetas agregadas</Text>
        <Text style={styles.emptyHint}>Presiona + para agregar una tarjeta</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={cards}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item }) => <CardItem card={item} />}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardUrgent: {
    borderColor: colors.danger,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  cardLeft: { flex: 1, gap: 3 },
  cardRight: { alignItems: 'flex-end', gap: 3 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.text,
  },
  cardBank: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  cardAmount: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.accent,
  },
  daysText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  purchasesList: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.xs },
  purchaseSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  purchaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  purchaseLeft: { flex: 1, gap: 2 },
  merchant: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  purchaseDate: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  installments: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.purple,
  },
  purchaseAmount: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  noPurchases: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
  noPurchasesText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  empty: { alignItems: 'center', paddingVertical: spacing.xl * 2, gap: spacing.sm },
  emptyText: { fontFamily: fonts.medium, fontSize: 16, color: colors.textMuted },
  emptyHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});
