import { useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { Income, Expense, CreditCard, CardPurchase, MonthlyTotals, MonthlyBarData, CategoryTotal } from '../../types';
import { getLast6Months, daysUntil } from '../utils/dates';

export function useFinances() {
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotals>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    pendingCobros: 0,
  });
  const [barData, setBarData] = useState<MonthlyBarData[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncome = useCallback(async (month: number, year: number) => {
    setLoading(true);
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const { data, error: err } = await supabase
        .from('income')
        .select('*, client:clients(id,name,phone,email)')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (err) throw err;
      setIncome(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExpenses = useCallback(async (month: number, year: number) => {
    setLoading(true);
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const { data, error: err } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (err) throw err;
      setExpenses(data || []);

      const catMap: Record<string, number> = {};
      for (const exp of data || []) {
        catMap[exp.category] = (catMap[exp.category] || 0) + exp.amount;
      }
      setCategoryTotals(
        Object.entries(catMap).map(([category, total]) => ({ category: category as any, total }))
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthlyTotals = useCallback(async (month: number, year: number) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const [incomeRes, expenseRes, pendingRes] = await Promise.all([
      supabase.from('income').select('amount').gte('date', startDate).lte('date', endDate),
      supabase.from('expenses').select('amount').gte('date', startDate).lte('date', endDate),
      supabase.from('income').select('amount').eq('status', 'Pendiente'),
    ]);

    const totalIncome = (incomeRes.data || []).reduce((s, r) => s + Number(r.amount), 0);
    const totalExpenses = (expenseRes.data || []).reduce((s, r) => s + Number(r.amount), 0);
    const pendingCobros = (pendingRes.data || []).reduce((s, r) => s + Number(r.amount), 0);

    setMonthlyTotals({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      pendingCobros,
    });
  }, []);

  const fetchBarData = useCallback(async () => {
    const months = getLast6Months();
    const results: MonthlyBarData[] = [];

    for (const { year, month, label } of months) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const [incRes, expRes] = await Promise.all([
        supabase.from('income').select('amount').gte('date', startDate).lte('date', endDate),
        supabase.from('expenses').select('amount').gte('date', startDate).lte('date', endDate),
      ]);

      results.push({
        month: label,
        income: (incRes.data || []).reduce((s, r) => s + Number(r.amount), 0),
        expenses: (expRes.data || []).reduce((s, r) => s + Number(r.amount), 0),
      });
    }

    setBarData(results);
  }, []);

  const fetchCards = useCallback(async () => {
    const { data: cardsData } = await supabase.from('credit_cards').select('*').order('created_at');
    if (!cardsData) return;

    const now = new Date();
    const enriched: CreditCard[] = await Promise.all(
      cardsData.map(async (card) => {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const { data: purchases } = await supabase
          .from('card_purchases')
          .select('*')
          .eq('card_id', card.id)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth);

        const totalMonth = (purchases || []).reduce((s, p) => s + Number(p.amount), 0);

        return {
          ...card,
          purchases: purchases || [],
          total_month: totalMonth,
          next_due_amount: totalMonth,
          days_until_due: daysUntil(card.due_day),
        };
      })
    );

    setCards(enriched);
  }, []);

  const fetchCardDues = useCallback(async () => {
    await fetchCards();
    return cards;
  }, [fetchCards, cards]);

  const addIncome = async (entry: Omit<Income, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase.from('income').insert(entry).select().single();
    if (err) throw err;
    setIncome((prev) => [data, ...prev]);
    return data;
  };

  const updateIncome = async (id: string, changes: Partial<Income>) => {
    const { error: err } = await supabase.from('income').update(changes).eq('id', id);
    if (err) throw err;
    setIncome((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  };

  const deleteIncome = async (id: string) => {
    const { error: err } = await supabase.from('income').delete().eq('id', id);
    if (err) throw err;
    setIncome((prev) => prev.filter((i) => i.id !== id));
  };

  const addExpense = async (entry: Omit<Expense, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase.from('expenses').insert(entry).select().single();
    if (err) throw err;
    setExpenses((prev) => [data, ...prev]);
    return data;
  };

  const updateExpense = async (id: string, changes: Partial<Expense>) => {
    const { error: err } = await supabase.from('expenses').update(changes).eq('id', id);
    if (err) throw err;
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  };

  const deleteExpense = async (id: string) => {
    const { error: err } = await supabase.from('expenses').delete().eq('id', id);
    if (err) throw err;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addCard = async (card: Omit<CreditCard, 'id' | 'created_at' | 'purchases' | 'total_month' | 'next_due_amount' | 'days_until_due'>) => {
    const { data, error: err } = await supabase.from('credit_cards').insert(card).select().single();
    if (err) throw err;
    await fetchCards();
    return data;
  };

  const addCardPurchase = async (purchase: Omit<CardPurchase, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase.from('card_purchases').insert(purchase).select().single();
    if (err) throw err;
    await fetchCards();
    return data;
  };

  return {
    income,
    expenses,
    cards,
    monthlyTotals,
    barData,
    categoryTotals,
    loading,
    error,
    fetchIncome,
    fetchExpenses,
    fetchMonthlyTotals,
    fetchBarData,
    fetchCards,
    fetchCardDues,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    addCard,
    addCardPurchase,
  };
}
