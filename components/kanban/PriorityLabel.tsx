import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Modal } from 'react-native';
import { Pencil, Check } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { PriorityLabel as PriorityLabelType } from '../../types';

const COLOR_OPTIONS = [
  '#a855f7', '#22c55e', '#3b82f6', '#f59e0b',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316',
];

interface PriorityLabelProps {
  label: PriorityLabelType;
  onUpdate: (id: string, text: string, color: string) => Promise<void>;
}

export function PriorityLabel({ label, onUpdate }: PriorityLabelProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(label.text);
  const [color, setColor] = useState(label.bg_color);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(label.id, text, color);
    setSaving(false);
    setEditing(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setEditing(true)}
        style={[styles.container, { backgroundColor: label.bg_color }]}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>{label.text}</Text>
        <Pencil size={12} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <View style={styles.overlay}>
          <View style={styles.editSheet}>
            <Text style={styles.editTitle}>Editar etiqueta</Text>

            <TextInput
              value={text}
              onChangeText={setText}
              style={styles.editInput}
              placeholderTextColor={colors.textMuted}
              placeholder="Texto de la etiqueta"
              selectionColor={colors.accent}
            />

            <Text style={styles.colorLabel}>Color</Text>
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
                />
              ))}
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} style={[styles.saveBtn, { backgroundColor: color }]} disabled={saving}>
                <Check size={16} color="#fff" />
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: spacing.xs,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  editSheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  editInput: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  colorLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.15 }],
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
  },
  cancelText: {
    fontFamily: fonts.medium,
    color: colors.textMuted,
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  saveText: {
    fontFamily: fonts.bold,
    color: '#fff',
    fontSize: 14,
  },
});
