import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: string;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#22c55e22', text: colors.success },
  warning: { bg: '#f59e0b22', text: colors.warning },
  danger: { bg: '#ef444422', text: colors.danger },
  info: { bg: '#00d4ff22', text: colors.accent },
  default: { bg: colors.surfaceElevated, text: colors.textMuted },
  purple: { bg: '#a855f722', text: colors.purple },
};

export function Badge({ label, variant = 'default', color }: BadgeProps) {
  const { bg, text } = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: color ? color + '22' : bg }]}>
      <Text style={[styles.text, { color: color || text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.4,
  },
});
