import { useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { Client, ClientDetail } from '../../types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });
      if (err) throw err;
      setClients(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClientDetail = useCallback(async (id: string): Promise<ClientDetail | null> => {
    const [clientRes, tasksRes, incomeRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('tasks').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      supabase.from('income').select('*').eq('client_id', id).order('date', { ascending: false }),
    ]);

    if (clientRes.error || !clientRes.data) return null;

    const totalBilled = (incomeRes.data || []).reduce((s, i) => s + Number(i.amount), 0);

    return {
      ...clientRes.data,
      tasks: tasksRes.data || [],
      income: incomeRes.data || [],
      total_billed: totalBilled,
      project_count: (tasksRes.data || []).length,
    };
  }, []);

  const addClient = async (client: Omit<Client, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase.from('clients').insert(client).select().single();
    if (err) throw err;
    setClients((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };

  const updateClient = async (id: string, changes: Partial<Client>) => {
    const { error: err } = await supabase.from('clients').update(changes).eq('id', id);
    if (err) throw err;
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)));
  };

  const deleteClient = async (id: string) => {
    const { error: err } = await supabase.from('clients').delete().eq('id', id);
    if (err) throw err;
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    fetchClientDetail,
    addClient,
    updateClient,
    deleteClient,
  };
}
