import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Calendar, User, DollarSign, MoveHorizontal } from 'lucide-react-native';
import { colors, fonts, radius, spacing, colorTagMap } from '../../constants/theme';
import { Task } from '../../types';
import { formatARS } from '../../lib/utils/formatCurrency';
import { formatDate } from '../../lib/utils/dates';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onLongPress: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onPress, onLongPress, onDelete }: TaskCardProps) {
  const accentColor = task.color_tag ? colorTagMap[task.color_tag] : colors.border;

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar tarea',
      `¿Eliminar "${task.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(task.id) },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(task)}
      onLongPress={() => onLongPress(task)}
      delayLongPress={400}
      activeOpacity={0.85}
      style={[styles.card, { borderLeftColor: accentColor }]}
    >
      <Text style={styles.title} numberOfLines={2}>{task.title}</Text>

      {task.client_name ? (
        <View style={styles.row}>
          <User size={11} color={colors.textMuted} />
          <Text style={styles.meta}>{task.client_name}</Text>
        </View>
      ) : null}

      {task.amount ? (
        <View style={styles.row}>
          <DollarSign size={11} color={colors.success} />
          <Text style={[styles.meta, { color: colors.success }]}>{formatARS(task.amount)}</Text>
        </View>
      ) : null}

      {task.due_date ? (
        <View style={styles.row}>
          <Calendar size={11} color={colors.textMuted} />
          <Text style={styles.meta}>{formatDate(task.due_date)}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity onPress={confirmDelete} hitSlop={8} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>Eliminar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onLongPress(task)} hitSlop={8}>
          <MoveHorizontal size={14} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  deleteBtn: { padding: 2 },
  deleteText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.danger,
  },
});
