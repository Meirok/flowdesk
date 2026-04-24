import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, LogOut } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';
import { colors, fonts, spacing } from '../../constants/theme';
import { Column, Task } from '../../types';
import AddTaskModal from '../modals/add-task';
import TaskDetailModal from '../modals/task-detail';
import AddIncomeModal from '../modals/add-income';

export default function KanbanScreen() {
  const insets = useSafeAreaInsets();
  const [addTaskColumnId, setAddTaskColumnId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [entregadoTask, setEntregadoTask] = useState<Task | null>(null);
  const [showCobradoSheet, setShowCobradoSheet] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Querés salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  };

  const handleMovedToEntregado = (task: Task, _col: Column) => {
    setEntregadoTask(task);
    setShowCobradoSheet(true);
  };

  const handleCobradoYes = () => {
    setShowCobradoSheet(false);
    setShowAddIncome(true);
  };

  const handleCobradoNo = () => {
    setShowCobradoSheet(false);
    setEntregadoTask(null);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Tablero</Text>
        <TouchableOpacity onPress={handleLogout} hitSlop={8} style={styles.logoutBtn}>
          <LogOut size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <KanbanBoard
        onAddTask={(columnId) => setAddTaskColumnId(columnId)}
        onTaskPress={(task) => setSelectedTask(task)}
        onMovedToEntregado={handleMovedToEntregado}
      />

      <AddTaskModal
        visible={!!addTaskColumnId}
        columnId={addTaskColumnId ?? ''}
        onClose={() => { setAddTaskColumnId(null); setRefreshKey(k => k + 1); }}
      />

      <TaskDetailModal
        visible={!!selectedTask}
        task={selectedTask}
        onClose={() => { setSelectedTask(null); setRefreshKey(k => k + 1); }}
      />

      <AddIncomeModal
        visible={showAddIncome}
        prefillClientName={entregadoTask?.client_name}
        prefillAmount={entregadoTask?.amount}
        prefillClientId={entregadoTask?.client_id}
        onClose={() => { setShowAddIncome(false); setEntregadoTask(null); }}
      />

      <Modal
        visible={showCobradoSheet}
        transparent
        animationType="slide"
        onRequestClose={handleCobradoNo}
      >
        <View style={styles.overlay}>
          <View style={styles.cobradoSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.cobradoTitle}>¿Marcar como cobrado?</Text>
            <Text style={styles.cobradoSubtitle}>
              "{entregadoTask?.title}" fue movida a Entregado.
            </Text>
            <TouchableOpacity onPress={handleCobradoYes} style={styles.yesBtn}>
              <Text style={styles.yesBtnText}>Sí, registrar cobro</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCobradoNo} style={styles.noBtn}>
              <Text style={styles.noBtnText}>No, solo mover</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
  },
  logoutBtn: { padding: 4 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  cobradoSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  cobradoTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
  },
  cobradoSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  yesBtn: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  yesBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
  noBtn: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  noBtnText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
