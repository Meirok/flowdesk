import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { IncomeStatus } from '../../types';
import { toISODate } from '../../lib/utils/dates';

const STATUSES: IncomeStatus[] = ['Pagado', 'Pendiente', 'Parcial'];

const statusColor: Record<IncomeStatus, string> = {
  Pagado: colors.success,
  Pendiente: colors.warning,
  Parcial: colors.accent,
};

interface AddIncomeModalProps {
  visible: boolean;
  onClose: () => void;
  prefillClientName?: string;
  prefillAmount?: number;
  prefillClientId?: string;
}

export default function AddIncomeModal({
  visible,
  onClose,
  prefillClientName,
  prefillAmount,
  prefillClientId,
}: AddIncomeModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toISODate(new Date()));
  const [status, setStatus] = useState<IncomeStatus>('Pagado');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setClientName(prefillClientName || '');
      setAmount(prefillAmount ? String(prefillAmount) : '');
    }
  }, [visible, prefillClientName, prefillAmount]);

  const reset = () => {
    setDescription('');
    setAmount('');
    setDate(toISODate(new Date()));
    setStatus('Pagado');
    setClientName('');
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

      let clientId = prefillClientId || null;

      if (clientName.trim() && !clientId) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('name', clientName.trim())
          .eq('user_id', userData.user.id)
          .single();

        if (existingClient) {
          clientId = existingClient.id;
        }
      }

      const parsedAmount = parseFloat(amount.replace(/[^0-9.,]/g, '').replace(',', '.'));

      await supabase.from('income').insert({
        user_id: userData.user.id,
        client_id: clientId,
        description: description.trim(),
        amount: parsedAmount,
        date,
        status,
      });

      handleClose();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={handleClose} title="Nuevo ingreso">
      <Input
        label="Descripción *"
        value={description}
        onChangeText={setDescription}
        placeholder="Ej: Diseño logo cliente"
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
        <Text style={styles.label}>Estado</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={[
                styles.statusBtn,
                status === s && { backgroundColor: statusColor[s] + '33', borderColor: statusColor[s] },
              ]}
            >
              <Text style={[styles.statusText, status === s && { color: statusColor[s] }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button label="Guardar ingreso" onPress={handleSave} loading={loading} fullWidth />
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
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
});
