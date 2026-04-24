import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useColumns } from '../../lib/hooks/useColumns';
import { useAllTasks } from '../../lib/hooks/useTasks';
import { Column, Task, PriorityLabel } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { colors, fonts, spacing } from '../../constants/theme';

interface KanbanBoardProps {
  onAddTask: (columnId: string) => void;
  onTaskPress: (task: Task) => void;
  onMovedToEntregado: (task: Task, targetColumn: Column) => void;
}

export function KanbanBoard({ onAddTask, onTaskPress, onMovedToEntregado }: KanbanBoardProps) {
  const insets = useSafeAreaInsets();
  const { columns, loading: colLoading, seedDefaultColumns } = useColumns();
  const { tasksByColumn, loading: tasksLoading, fetchAll, moveTask } = useAllTasks();
  const [priorityLabels, setPriorityLabels] = useState<Record<string, PriorityLabel[]>>({});

  useEffect(() => {
    if (columns.length === 0 && !colLoading) {
      seedDefaultColumns();
    }
  }, [columns, colLoading]);

  useEffect(() => {
    fetchPriorityLabels();
  }, [columns]);

  const fetchPriorityLabels = async () => {
    if (columns.length === 0) return;
    const { data } = await supabase.from('priority_labels').select('*');
    const grouped: Record<string, PriorityLabel[]> = {};
    for (const label of data || []) {
      if (!grouped[label.column_id]) grouped[label.column_id] = [];
      grouped[label.column_id].push(label);
    }
    setPriorityLabels(grouped);
  };

  const handleUpdateLabel = async (id: string, text: string, color: string) => {
    await supabase.from('priority_labels').update({ text, bg_color: color }).eq('id', id);
    await fetchPriorityLabels();
  };

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
    await fetchAll();
  };

  const handleMoveTask = useCallback(
    async (task: Task, targetColumn: Column) => {
      const entregadoColumn = columns.find((c) => c.name === 'Entregado');
      if (entregadoColumn && targetColumn.id === entregadoColumn.id) {
        onMovedToEntregado(task, targetColumn);
      }

      const targetTasks = tasksByColumn[targetColumn.id] || [];
      const newPosition = targetTasks.length;
      await moveTask(task.id, task.column_id, targetColumn.id, newPosition);
    },
    [columns, tasksByColumn, moveTask, onMovedToEntregado]
  );

  if (colLoading || tasksLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.board,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={tasksByColumn[column.id] || []}
          priorityLabels={priorityLabels[column.id] || []}
          columns={columns}
          onAddTask={onAddTask}
          onTaskPress={onTaskPress}
          onMoveTask={handleMoveTask}
          onDeleteTask={handleDeleteTask}
          onUpdateLabel={handleUpdateLabel}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  board: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
