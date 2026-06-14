"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { getAllTransactions } from "@/lib/actions";
import { formatCurrency, cn } from "@/lib/utils";
import { Download, PieChart as PieChartIcon, TrendingUp, Wallet, ChevronDown, ChevronUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { CATEGORIES } from "@/lib/categories";
import { useCurrency } from "@/components/CurrencyProvider";

export default function ReportsPage() {
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getAllTransactions();
      setTransactions(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const [year, month] = selectedMonth.split("-").map(Number);

  const monthTxs = useMemo(() => {
    return transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getFullYear() === year && d.getMonth() === month - 1;
    });
  }, [transactions, year, month]);

  const { totalIncome, totalExpense } = useMemo(() => {
    let inc = 0, exp = 0;
    monthTxs.forEach(tx => {
      if (tx.type === "INCOME") inc += tx.amount;
      if (tx.type === "EXPENSE") exp += tx.amount;
    });
    return { totalIncome: inc, totalExpense: exp };
  }, [monthTxs]);

  const netSavings = totalIncome - totalExpense;

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const expensesByCategory = useMemo(() => {
    const acc: Record<string, { total: number, subcategories: Record<string, number> }> = {};
    monthTxs.filter(tx => tx.type === "EXPENSE").forEach(tx => {
      if (!acc[tx.category]) {
        acc[tx.category] = { total: 0, subcategories: {} };
      }
      acc[tx.category].total += tx.amount;

      const subKey = tx.subcategory === 'Others' ? tx.subcategoryCustom || 'Others' : tx.subcategory || 'Uncategorized';
      acc[tx.category].subcategories[subKey] = (acc[tx.category].subcategories[subKey] || 0) + tx.amount;
    });

    return Object.keys(acc).map(key => ({
      name: key,
      value: acc[key].total,
      subcategories: Object.keys(acc[key].subcategories).map(subKey => ({
        name: subKey,
        value: acc[key].subcategories[subKey]
      })).sort((a, b) => b.value - a.value),
      color: CATEGORIES[key]?.color.replace('text-', '') || 'gray-500'
    })).sort((a, b) => b.value - a.value);
  }, [monthTxs]);

  const colorsMap: Record<string, string> = {
    'orange-500': '#f97316', 'blue-500': '#3b82f6', 'pink-500': '#ec4899',
    'purple-500': '#a855f7', 'yellow-500': '#eab308', 'red-500': '#ef4444',
    'teal-500': '#14b8a6', 'indigo-500': '#6366f1', 'rose-500': '#f43f5e',
    'sky-500': '#0ea5e9', 'green-500': '#22c55e', 'emerald-500': '#10b981',
    'cyan-500': '#06b6d4', 'gray-500': '#6b7280'
  };

  // Trend Data (Last 12 Months)
  const trendData = useMemo(() => {
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();

      let inc = 0, exp = 0;
      transactions.forEach(tx => {
        const txd = new Date(tx.date);
        if (txd.getMonth() === m && txd.getFullYear() === y) {
          if (tx.type === "INCOME") inc += tx.amount;
          if (tx.type === "EXPENSE") exp += tx.amount;
        }
      });

      result.push({
        name: d.toLocaleDateString("en-US", { month: "short" }),
        Savings: inc - exp
      });
    }
    return result;
  }, [transactions]);

  const exportCSV = () => {
    const headers = ["Date,Description,Category,Subcategory,Type,Amount,Notes"];
    const rows = transactions.map(tx => {
      return `"${tx.date}","${tx.description.replace(/"/g, '""')}","${tx.category}","${tx.subcategory || ''}","${tx.type}",${tx.amount},"${tx.notes || ''}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finflow_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e: any) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-48"
            />
            <Button variant="secondary" onClick={exportCSV}>
              <Download size={18} className="mr-2" /> Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading reports...</div>
        ) : (
          <div className="space-y-6">

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalIncome, currency)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-rose-500">{formatCurrency(totalExpense, currency)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-500 mb-1">Net Savings</p>
                  <p className={cn("text-2xl font-bold", netSavings >= 0 ? "text-indigo-500" : "text-rose-500")}>
                    {netSavings >= 0 ? "+" : ""}{formatCurrency(netSavings, currency)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Category Breakdown Table */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {expensesByCategory.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">No expenses this month</div>
                  ) : (
                    <div className="space-y-4">
                      {expensesByCategory.map((item) => {
                        const pct = ((item.value / totalExpense) * 100).toFixed(1);
                        const isExpanded = expandedCategory === item.name;
                        return (
                          <div key={item.name} className="space-y-2">
                            <div
                              className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 -mx-2 rounded-lg transition-colors"
                              onClick={() => setExpandedCategory(isExpanded ? null : item.name)}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className={cn("w-3 h-3 rounded-full", `bg-${item.color}`)} style={{ backgroundColor: colorsMap[item.color] }} />
                                <span className="font-medium">{item.name}</span>
                                {item.subcategories.length > 0 && (
                                  isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />
                                )}
                              </div>
                              <div className="text-right flex-1">
                                <span className="font-semibold">{formatCurrency(item.value, currency)}</span>
                                <span className="text-xs text-slate-500 ml-2 w-12 inline-block">{pct}%</span>
                              </div>
                            </div>

                            {isExpanded && item.subcategories.length > 0 && (
                              <div className="pl-8 pr-2 py-2 space-y-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm">
                                {item.subcategories.map(sub => (
                                  <div key={sub.name} className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                    <span>{sub.name}</span>
                                    <span>{formatCurrency(sub.value, currency)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Net Savings Trend Chart */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Savings Trend (12 Months)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(val) => `₹${val/1000}k`} tick={{ fontSize: 12 }} />
                      <RechartsTooltip formatter={(val: any) => formatCurrency(val as number, currency)} />
                      <Line type="monotone" dataKey="Savings" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </div>

          </div>
        )}
      </motion.main>
      <MobileNav />
    </>
  );
}
