import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, fonts, radius, spacing, colorTagMap } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { ColorTag } from '../../types';

const COLOR_TAGS: ColorTag[] = ['red', 'yellow', 'green', 'blue', 'purple'];

interface AddTaskModalProps {
  visible: boolean;
  columnId: string;
  onClose: () => void;
}

export default function AddTaskModal({ visible, columnId, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [colorTag, setColorTag] = useState<ColorTag | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setTitle('');
    setClientName('');
    setAmount('');
    setDueDate('');
    setColorTag(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No autenticado');

      const { data: existing } = await supabase
        .from('tasks')
        .select('position')
        .eq('column_id', columnId)
        .order('position', { ascending: false })
        .limit(1);

      const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

      const parsedAmount = amount ? parseFloat(amount.replace(/[^0-9.,]/g, '').replace(',', '.')) : null;

      await supabase.from('tasks').insert({
        user_id: userData.user.id,
        column_id: columnId,
        title: title.trim(),
        client_name: clientName.trim() || null,
        amount: parsedAmount,
        due_date: dueDate.trim() || null,
        color_tag: colorTag,
        position,
      });

      handleClose();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={handleClose} title="Nueva tarea">
      <Input
        label="Título *"
        value={title}
        onChangeText={setTitle}
        placeholder="¿Qué hay que hacer?"
        returnKeyType="next"
      />

      <Input
        label="Cliente"
        value={clientName}
        onChangeText={setClientName}
        placeholder="Nombre del cliente"
        returnKeyType="next"
      />

      <Input
        label="Monto (ARS)"
        value={amount}
        onChangeText={setAmount}
        placeholder="0"
        keyboardType="numeric"
        returnKeyType="next"
      />

      <Input
        label="Fecha límite (AAAA-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="2024-12-31"
        returnKeyType="done"
      />

      <View style={styles.section}>
        <Text style={styles.label}>Color de etiqueta</Text>
        <View style={styles.colorRow}>
          {COLOR_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => setColorTag(colorTag === tag ? null : tag)}
              style={[
                styles.colorDot,
                { backgroundColor: colorTagMap[tag] },
                colorTag === tag && styles.colorDotSelected,
              ]}
            />
          ))}
          {colorTag && (
            <TouchableOpacity onPress={() => setColorTag(null)} style={styles.clearColor}>
              <Text style={styles.clearColorText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Button label="Crear tarea" onPress={handleSave} loading={loading} fullWidth />
    </Modal>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
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
  clearColor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearColorText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textMuted,
  },
});
