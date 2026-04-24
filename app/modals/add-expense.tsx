import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { ExpenseCategory, PaymentMethod } from '../../types';
import { toISODate } from '../../lib/utils/dates';

const CATEGORIES: ExpenseCategory[] = ['Servicios', 'Equipamiento', 'Software', 'Impuestos', 'Marketing', 'Varios'];
const METHODS: PaymentMethod[] = ['Efectivo', 'Transferencia', 'Débito', 'Crédito'];

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddExpenseModal({ visible, onClose }: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toISODate(new Date()));
  const [category, setCategory] = useState<ExpenseCategory>('Varios');
  const [method, setMethod] = useState<PaymentMethod>('Transferencia');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setDescription('');
    setAmount('');
    setDate(toISODate(new Date()));
    setCategory('Varios');
    setMethod('Transferencia');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!description.trim() || !amount) {
      Alert.alert('Error', 'Descripción y monto son requeridos');
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No autenticado');

      const parsedAmount = parseFloat(amount.replace(/[^0-9.,]/g, '').replace(',', '.'));

      await supabase.from('expenses').insert({
        user_id: userData.user.id,
        description: description.trim(),
        category,
        amount: parsedAmount,
        date,
        payment_method: method,
      });

      handleClose();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={handleClose} title="Nuevo gasto">
      <Input
        label="Descripción *"
        value={description}
        onChangeText={setDescription}
        placeholder="Ej: Hosting mensual"
        returnKeyType="next"
      />

      <Input
        label="Monto (ARS) *"
        value={amount}
        onChangeText={setAmount}
        placeholder="0"
        keyboardType="numeric"
        returnKeyType="next"
      />

      <Input
        label="Fecha (AAAA-MM-DD)"
        value={date}
        onChangeText={setDate}
        placeholder="2024-01-01"
        returnKeyType="done"
      />

      <View style={styles.section}>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.chip, category === cat && styles.chipActive]}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Forma de pago</Text>
        <View style={styles.row}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMethod(m)}
              style={[styles.methodBtn, method === m && styles.methodBtnActive]}
            >
              <Text style={[styles.methodText, method === m && styles.methodTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button label="Guardar gasto" onPress={handleSave} loading={loading} fullWidth />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent + '22',
    borderColor: colors.accent,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.accent,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  methodBtn: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodBtnActive: {
    backgroundColor: colors.purple + '22',
    borderColor: colors.purple,
  },
  methodText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  methodTextActive: {
    color: colors.purple,
  },
});
