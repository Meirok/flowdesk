import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

interface AddClientModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddClientModal({ visible, onClose }: AddClientModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No autenticado');

      await supabase.from('clients').insert({
        user_id: userData.user.id,
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        notes: notes.trim() || null,
      });

      handleClose();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={handleClose} title="Nuevo cliente">
      <Input
        label="Nombre *"
        value={name}
        onChangeText={setName}
        placeholder="Nombre completo o empresa"
        returnKeyType="next"
        autoCapitalize="words"
      />

      <Input
        label="Teléfono"
        value={phone}
        onChangeText={setPhone}
        placeholder="Ej: 1123456789"
        keyboardType="phone-pad"
        returnKeyType="next"
      />

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="cliente@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
      />

      <Input
        label="Notas"
        value={notes}
        onChangeText={setNotes}
        placeholder="Información adicional..."
        multiline
        numberOfLines={3}
        returnKeyType="done"
      />

      <Button label="Crear cliente" onPress={handleSave} loading={loading} fullWidth />
    </Modal>
  );
}
