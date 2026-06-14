"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { BudgetForm } from "@/components/BudgetForm";
import { getBudgets, getAllTransactions } from "@/lib/actions";
import { formatCurrency, cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";
import { Plus, AlertTriangle, PieChart, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useCurrency } from "@/components/CurrencyProvider";

export default function BudgetsPage() {
  const { currency } = useCurrency();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [bData, tData] = await Promise.all([getBudgets(), getAllTransactions()]);
    setBudgets(bData);
    setTransactions(tData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = transactions.filter(
    (tx) => tx.type === "EXPENSE" && new Date(tx.date).getMonth() === currentMonth && new Date(tx.date).getFullYear() === currentYear
  );

  const budgetData = budgets.map((b) => {
    const spent = currentMonthExpenses
      .filter((tx) => tx.category === b.category)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const pct = (spent / b.limit) * 100;

    let statusColor = "bg-emerald-500";
    if (pct > 90) statusColor = "bg-rose-500";
    else if (pct > 75) statusColor = "bg-orange-500";

    return { ...b, spent, pct, statusColor };
  });

  const chartData = budgetData.map(b => ({
    name: b.category,
    Budget: b.limit,
    Spent: b.spent,
  }));

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2" size={18} /> Set Budget
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 flex flex-col items-center">
            <PieChart size={48} className="mb-4 opacity-20" />
            <p>No budgets set yet. Start tracking your limits!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Progress Bars List */}
            <div className="space-y-4">
              <AnimatePresence>
                {budgetData.map((b) => {
                  const CatIcon = CATEGORIES[b.category]?.icon || Wallet;
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className={cn("overflow-hidden transition-all", b.pct > 90 && "border-rose-500/50 shadow-rose-500/10")}>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CatIcon size={18} className={CATEGORIES[b.category]?.color || "text-slate-500"} />
                              <h3 className="font-semibold">{b.category}</h3>
                            </div>
                            {b.pct > 80 && (
                              <div className="flex items-center gap-1 text-xs text-rose-500 font-bold bg-rose-500/10 px-2 py-1 rounded-full">
                                <AlertTriangle size={12} /> {b.pct > 100 ? "EXCEEDED" : "NEAR LIMIT"}
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between text-sm mb-2 mt-4">
                            <span>{formatCurrency(b.spent, currency)} spent</span>
                            <span className="text-slate-500">of {formatCurrency(b.limit, currency)}</span>
                          </div>

                          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(b.pct, 100)}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={cn("h-full transition-colors", b.statusColor)}
                            />
                          </div>
                          <p className="text-right text-xs text-slate-500 mt-1">
                            {b.pct.toFixed(1)}%
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Comparison Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full min-h-[400px]">
                <CardHeader>
                  <CardTitle>Budget vs Actual</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip formatter={(val: any) => formatCurrency(val as number, currency)} />
                      <Legend />
                      <Bar dataKey="Budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        )}
      </motion.main>
      <MobileNav />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Set Budget">
        <BudgetForm onSuccess={() => { setIsFormOpen(false); loadData(); }} />
      </Modal>
    </>
  );
}
