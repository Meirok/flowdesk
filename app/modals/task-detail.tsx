import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Calendar, User, DollarSign, FileText } from 'lucide-react-native';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, fonts, radius, spacing, colorTagMap } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { Task, ColorTag } from '../../types';
import { formatARS } from '../../lib/utils/formatCurrency';
import { formatDate } from '../../lib/utils/dates';

const COLOR_TAGS: ColorTag[] = ['red', 'yellow', 'green', 'blue', 'purple'];

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
}

export default function TaskDetailModal({ visible, task, onClose }: TaskDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [colorTag, setColorTag] = useState<ColorTag | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setClientName(task.client_name || '');
      setAmount(task.amount ? String(task.amount) : '');
      setDueDate(task.due_date || '');
      setDescription(task.description || '');
      setColorTag((task.color_tag as ColorTag) || null);
    }
  }, [task]);

  const handleSave = async () => {
    if (!task || !title.trim()) return;
    setLoading(true);
    const parsedAmount = amount ? parseFloat(amount.replace(/[^0-9.]/g, '')) : null;
    const { error } = await supabase.from('tasks').update({
      title: title.trim(),
      client_name: clientName.trim() || null,
      amount: parsedAmount,
      due_date: dueDate.trim() || null,
      description: description.trim() || null,
      color_tag: colorTag,
    }).eq('id', task.id);

    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setEditing(false);
      onClose();
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar tarea', '¿Eliminar esta tarea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (!task) return;
          await supabase.from('tasks').delete().eq('id', task.id);
          onClose();
        },
      },
    ]);
  };

  if (!task) return null;

  const accentColor = task.color_tag ? colorTagMap[task.color_tag] : colors.border;

  return (
    <Modal visible={visible} onClose={onClose} title={editing ? 'Editar tarea' : 'Detalle'}>
      {!editing ? (
        <>
          <View style={[styles.titleRow, { borderLeftColor: accentColor }]}>
            <Text style={styles.taskTitle}>{task.title}</Text>
          </View>

          {task.description ? (
            <View style={styles.detailRow}>
              <FileText size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>{task.description}</Text>
            </View>
          ) : null}

          {task.client_name ? (
            <View style={styles.detailRow}>
              <User size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>{task.client_name}</Text>
            </View>
          ) : null}

          {task.amount ? (
            <View style={styles.detailRow}>
              <DollarSign size={14} color={colors.success} />
              <Text style={[styles.detailText, { color: colors.success }]}>{formatARS(task.amount)}</Text>
            </View>
          ) : null}

          {task.due_date ? (
            <View style={styles.detailRow}>
              <Calendar size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>{formatDate(task.due_date)}</Text>
            </View>
          ) : null}

          <View style={styles.btnRow}>
            <Button label="Editar" onPress={() => setEditing(true)} variant="secondary" style={styles.btn} />
            <Button label="Eliminar" onPress={handleDelete} variant="danger" style={styles.btn} />
          </View>
        </>
      ) : (
        <>
          <Input label="Título *" value={title} onChangeText={setTitle} />
          <Input label="Cliente" value={clientName} onChangeText={setClientName} />
          <Input label="Monto (ARS)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <Input label="Fecha límite (AAAA-MM-DD)" value={dueDate} onChangeText={setDueDate} />
          <Input label="Descripción" value={description} onChangeText={setDescription} multiline numberOfLines={3} />

          <View style={styles.section}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
              {COLOR_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setColorTag(colorTag === tag ? null : tag)}
                  style={[styles.colorDot, { backgroundColor: colorTagMap[tag] }, colorTag === tag && styles.colorDotSelected]}
                />
              ))}
            </View>
          </View>

          <View style={styles.btnRow}>
            <Button label="Cancelar" onPress={() => setEditing(false)} variant="ghost" style={styles.btn} />
            <Button label="Guardar" onPress={handleSave} loading={loading} style={styles.btn} />
          </View>
        </>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    borderLeftWidth: 4,
    paddingLeft: spacing.sm,
  },
  taskTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    lineHeight: 28,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  detailText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  btn: { flex: 1 },
  section: { gap: spacing.sm },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  colorRow: { flexDirection: 'row', gap: spacing.sm },
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
});
