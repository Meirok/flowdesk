import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { Column, Task, PriorityLabel as PriorityLabelType } from '../../types';
import { TaskCard } from './TaskCard';
import { PriorityLabel } from './PriorityLabel';

const COLUMN_WIDTH = 280;

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  priorityLabels: PriorityLabelType[];
  columns: Column[];
  onAddTask: (columnId: string) => void;
  onTaskPress: (task: Task) => void;
  onMoveTask: (task: Task, targetColumn: Column) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateLabel: (id: string, text: string, color: string) => Promise<void>;
}

export function KanbanColumn({
  column,
  tasks,
  priorityLabels,
  columns,
  onAddTask,
  onTaskPress,
  onMoveTask,
  onDeleteTask,
  onUpdateLabel,
}: KanbanColumnProps) {
  const [movingTask, setMovingTask] = useState<Task | null>(null);
  const accentColor = column.color || colors.border;

  const sortedLabels = [...priorityLabels].sort((a, b) => a.position - b.position);

  const handleLongPress = (task: Task) => {
    setMovingTask(task);
  };

  const handleMoveToColumn = (targetColumn: Column) => {
    if (!movingTask) return;
    setMovingTask(null);
    onMoveTask(movingTask, targetColumn);
  };

  const renderItem = useCallback(({ item }: { item: Task | PriorityLabelType }) => {
    if ('bg_color' in item) {
      return <PriorityLabel label={item} onUpdate={onUpdateLabel} />;
    }
    return (
      <TaskCard
        task={item}
        onPress={onTaskPress}
        onLongPress={handleLongPress}
        onDelete={onDeleteTask}
      />
    );
  }, [onTaskPress, onDeleteTask, onUpdateLabel]);

  const combinedData: Array<Task | PriorityLabelType> = [...sortedLabels, ...tasks].sort((a, b) => {
    const posA = 'position' in a ? a.position : 0;
    const posB = 'position' in b ? b.position : 0;
    return posA - posB;
  });

  return (
    <View style={styles.column}>
      <View style={[styles.header, { borderBottomColor: accentColor }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.columnName, column.color ? { color: accentColor } : undefined]}>
            {column.name}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{tasks.length}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onAddTask(column.id)}
          hitSlop={8}
          style={styles.addBtn}
        >
          <Plus size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={combinedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Sin tareas</Text>
          </View>
        }
      />

      <Modal
        visible={!!movingTask}
        transparent
        animationType="slide"
        onRequestClose={() => setMovingTask(null)}
      >
        <View style={styles.moveOverlay}>
          <View style={styles.moveSheet}>
            <View style={styles.moveHandle} />
            <Text style={styles.moveTitle}>Mover "{movingTask?.title}"</Text>
            <Text style={styles.moveSubtitle}>Selecciona la columna de destino</Text>
            {columns
              .filter((c) => c.id !== column.id)
              .map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => handleMoveToColumn(c)}
                  style={styles.columnOption}
                >
                  <View style={[styles.columnDot, { backgroundColor: c.color || colors.border }]} />
                  <Text style={styles.columnOptionText}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            <TouchableOpacity onPress={() => setMovingTask(null)} style={styles.cancelMove}>
              <Text style={styles.cancelMoveText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: COLUMN_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
    maxHeight: '100%',
    flexShrink: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  columnName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  countBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textMuted,
  },
  addBtn: {
    padding: 4,
  },
  list: {
    padding: spacing.sm,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  moveOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  moveSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  moveHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  moveTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  moveSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  columnOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
  },
  columnDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  columnOptionText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  cancelMove: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  cancelMoveText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
