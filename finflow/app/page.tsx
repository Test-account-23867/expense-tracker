"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { formatCurrency, cn } from "@/lib/utils";
import { getTransactions, getEMIs } from "@/lib/actions";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { CATEGORIES } from "@/lib/categories";
import { Wallet, TrendingUp, TrendingDown, Percent, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { useCurrency } from "@/components/CurrencyProvider";

function AnimatedCounter({ value, currency }: { value: number, currency: string }) {
  const spring = useSpring(0, { bounce: 0, duration: 1000 });
  const display = useTransform(spring, (current) => formatCurrency(Math.floor(current), currency));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function Dashboard() {
  const { currency } = useCurrency();
  const [data, setData] = useState<any>({ txs: [], emis: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const txs = await getTransactions();
      const emis = await getEMIs();
      setData({ txs, emis });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let incomeThisMonth = 0;
  let expenseThisMonth = 0;

  data.txs.forEach((tx: any) => {
    const d = new Date(tx.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      if (tx.type === "INCOME") incomeThisMonth += tx.amount;
      if (tx.type === "EXPENSE") expenseThisMonth += tx.amount;
    }
  });

  const totalBalance = incomeThisMonth - expenseThisMonth; // Simplified logic
  const savingsRate = incomeThisMonth > 0 ? ((incomeThisMonth - expenseThisMonth) / incomeThisMonth) * 100 : 0;

  // Chart Data Preparation
  const expensesByCategory = data.txs
    .filter((tx: any) => tx.type === "EXPENSE" && new Date(tx.date).getMonth() === currentMonth)
    .reduce((acc: any, tx: any) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key],
    color: CATEGORIES[key]?.color.replace('text-', '') || 'gray-500' // Extract base color
  })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5

  const colorsMap: any = {
    'orange-500': '#f97316', 'blue-500': '#3b82f6', 'pink-500': '#ec4899',
    'purple-500': '#a855f7', 'yellow-500': '#eab308', 'red-500': '#ef4444',
    'teal-500': '#14b8a6', 'indigo-500': '#6366f1', 'rose-500': '#f43f5e',
    'sky-500': '#0ea5e9', 'green-500': '#22c55e', 'emerald-500': '#10b981',
    'cyan-500': '#06b6d4', 'gray-500': '#6b7280'
  };

  // 6 Month Cash Flow Data
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleDateString('en-US', { month: 'short' }) };
  }).reverse();

  const cashFlowData = last6Months.map(m => {
    let inc = 0, exp = 0;
    data.txs.forEach((tx: any) => {
      const d = new Date(tx.date);
      if (d.getMonth() === m.month && d.getFullYear() === m.year) {
        if (tx.type === "INCOME") inc += tx.amount;
        if (tx.type === "EXPENSE") exp += tx.amount;
      }
    });
    return { name: m.label, Income: inc, Expense: exp };
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } }
  };

  return (
    <>
      <Navbar />
      <motion.main
        initial="hidden" animate="show" variants={containerVariants}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-6"
      >
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><AnimatedCounter value={totalBalance} currency={currency} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income (Month)</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500"><AnimatedCounter value={incomeThisMonth} currency={currency} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses (Month)</CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-500"><AnimatedCounter value={expenseThisMonth} currency={currency} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <Percent className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Area */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-[300px]">
                {cashFlowData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip formatter={(val: any) => formatCurrency(val as number, currency)} />
                      <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500">No cash flow data</p>
                )}
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-[300px]">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={80}
                        paddingAngle={5} dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colorsMap[entry.color] || '#cbd5e1'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => formatCurrency(val as number, currency)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500">No expenses this month</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Widgets */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.txs.slice(0, 5).map((tx: any) => {
                    const CatIcon = CATEGORIES[tx.category]?.icon || Wallet;
                    const catColor = CATEGORIES[tx.category]?.color || "text-slate-500";
                    return (
                      <div key={tx.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl bg-white/50 dark:bg-black/20", catColor)}>
                            <CatIcon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{tx.description}</p>
                            <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                        <span className={cn("font-medium text-sm", tx.type === "INCOME" ? "text-emerald-500" : "")}>
                          {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount, currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Link href="/transactions" className="mt-4 flex items-center justify-center gap-1 text-sm text-indigo-500 hover:text-indigo-600">
                  View All <ArrowRight size={14} />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.main>
      <MobileNav />
    </>
  );
}
