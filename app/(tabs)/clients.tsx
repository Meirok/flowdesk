import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Phone, Mail, MessageCircle, Trash2, ChevronRight } from 'lucide-react-native';
import { useClients } from '../../lib/hooks/useClients';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { Client } from '../../types';
import AddClientModal from '../modals/add-client';

export default function ClientsScreen() {
  const insets = useSafeAreaInsets();
  const { clients, loading, fetchClients, deleteClient } = useClients();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const handleWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const url = `https://wa.me/54${cleaned}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'No se pudo abrir WhatsApp')
    );
  };

  const handleDelete = (client: Client) => {
    Alert.alert(
      'Eliminar cliente',
      `¿Eliminar a ${client.name}? Se perderán todos los datos asociados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteClient(client.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Client }) => (
    <View style={styles.clientCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        {item.email ? (
          <View style={styles.metaRow}>
            <Mail size={12} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>{item.email}</Text>
          </View>
        ) : null}
        {item.phone ? (
          <View style={styles.metaRow}>
            <Phone size={12} color={colors.textMuted} />
            <Text style={styles.metaText}>{item.phone}</Text>
          </View>
        ) : null}
        {item.notes ? (
          <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {item.phone ? (
          <TouchableOpacity
            onPress={() => handleWhatsApp(item.phone!)}
            style={styles.actionBtn}
            hitSlop={8}
          >
            <MessageCircle size={18} color="#25d366" />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <Trash2 size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <Text style={styles.count}>{clients.length} clientes</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Sin clientes todavía</Text>
              <Text style={styles.emptyHint}>Presiona + para agregar tu primer cliente</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => setShowAdd(true)}
      >
        <Plus size={24} color={colors.bg} />
      </TouchableOpacity>

      <AddClientModal
        visible={showAdd}
        onClose={() => { setShowAdd(false); fetchClients(); }}
      />
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
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  count: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  list: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accent + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.accent,
  },
  clientInfo: { flex: 1, gap: 3 },
  clientName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  notes: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  actions: { gap: spacing.sm },
  actionBtn: { padding: 4 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: spacing.sm },
  emptyText: { fontFamily: fonts.medium, fontSize: 16, color: colors.textMuted },
  emptyHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});
