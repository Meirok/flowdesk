import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Column } from '../../types';

export function useColumns() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColumns = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('columns')
        .select('*')
        .order('position', { ascending: true });

      if (err) throw err;
      setColumns(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColumns();

    const channel = supabase
      .channel('columns_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'columns' }, () => {
        fetchColumns();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchColumns]);

  const addColumn = async (name: string, color?: string) => {
    const maxPos = columns.reduce((max, c) => Math.max(max, c.position), -1);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error: err } = await supabase.from('columns').insert({
      user_id: userData.user.id,
      name,
      color,
      position: maxPos + 1,
    });
    if (err) throw err;
    await fetchColumns();
  };

  const updateColumn = async (id: string, changes: Partial<Column>) => {
    const { error: err } = await supabase.from('columns').update(changes).eq('id', id);
    if (err) throw err;
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)));
  };

  const deleteColumn = async (id: string) => {
    const { error: err } = await supabase.from('columns').delete().eq('id', id);
    if (err) throw err;
    setColumns((prev) => prev.filter((c) => c.id !== id));
  };

  const seedDefaultColumns = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    await supabase.rpc('seed_default_columns', { p_user_id: userData.user.id });
    await fetchColumns();
  };

  return { columns, loading, error, fetchColumns, addColumn, updateColumn, deleteColumn, seedDefaultColumns };
}
