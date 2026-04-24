import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Task } from '../../types';

export function useTasks(columnId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (colId?: string) => {
    try {
      setLoading(true);
      let query = supabase.from('tasks').select('*').order('position', { ascending: true });
      const targetCol = colId ?? columnId;
      if (targetCol) query = query.eq('column_id', targetCol);

      const { data, error: err } = await query;
      if (err) throw err;
      setTasks(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [columnId]);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel(`tasks_${columnId ?? 'all'}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: columnId ? `column_id=eq.${columnId}` : undefined,
      }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks, columnId]);

  const addTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error: err } = await supabase.from('tasks').insert(task).select().single();
    if (err) throw err;
    setTasks((prev) => [...prev, data]);
    return data;
  };

  const updateTask = async (id: string, changes: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
    const { error: err } = await supabase.from('tasks').update(changes).eq('id', id);
    if (err) {
      fetchTasks();
      throw err;
    }
  };

  const moveTask = async (id: string, newColumnId: string, newPosition: number) => {
    setTasks((prev) =>
      prev
        .filter((t) => t.id !== id)
        .concat(prev.filter((t) => t.id === id).map((t) => ({ ...t, column_id: newColumnId, position: newPosition })))
    );

    const { error: err } = await supabase
      .from('tasks')
      .update({ column_id: newColumnId, position: newPosition })
      .eq('id', id);

    if (err) {
      fetchTasks();
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error: err } = await supabase.from('tasks').delete().eq('id', id);
    if (err) {
      fetchTasks();
      throw err;
    }
  };

  const reorderTasks = async (reordered: Task[]) => {
    setTasks(reordered);
    const updates = reordered.map((t, i) =>
      supabase.from('tasks').update({ position: i }).eq('id', t.id)
    );
    await Promise.all(updates);
  };

  return { tasks, loading, error, fetchTasks, addTask, updateTask, moveTask, deleteTask, reorderTasks };
}

export function useAllTasks() {
  const [tasksByColumn, setTasksByColumn] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('tasks').select('*').order('position', { ascending: true });
    const grouped: Record<string, Task[]> = {};
    for (const task of data || []) {
      if (!grouped[task.column_id]) grouped[task.column_id] = [];
      grouped[task.column_id].push(task);
    }
    setTasksByColumn(grouped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel('all_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const moveTask = async (taskId: string, fromColumnId: string, toColumnId: string, newPosition: number) => {
    setTasksByColumn((prev) => {
      const fromTasks = (prev[fromColumnId] || []).filter((t) => t.id !== taskId);
      const movedTask = (prev[fromColumnId] || []).find((t) => t.id === taskId);
      if (!movedTask) return prev;
      const toTasks = [...(prev[toColumnId] || [])];
      toTasks.splice(newPosition, 0, { ...movedTask, column_id: toColumnId });
      return { ...prev, [fromColumnId]: fromTasks, [toColumnId]: toTasks };
    });

    await supabase.from('tasks').update({ column_id: toColumnId, position: newPosition }).eq('id', taskId);
  };

  return { tasksByColumn, loading, fetchAll, moveTask };
}
