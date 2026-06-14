"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { EmiForm } from "@/components/EmiForm";
import { getEMIs, markEmiPaid } from "@/lib/actions";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, Home, Car, User, BookOpen, CreditCard, HelpCircle, CalendarCheck } from "lucide-react";
import { differenceInMonths, addMonths } from "date-fns";
import { useCurrency } from "@/components/CurrencyProvider";

export default function EmisPage() {
  const { currency } = useCurrency();
  const [emis, setEmis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getEMIs();
    setEmis(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkPaid = async (emi: any) => {
    await markEmiPaid(emi.id, emi.emiAmount, emi.lenderName);
    alert(`Marked EMI for ${emi.lenderName} as paid!`);
    loadData();
  };

  const getLoanIcon = (type: string) => {
    switch (type) {
      case "Home": return <Home size={24} className="text-teal-500" />;
      case "Car": return <Car size={24} className="text-blue-500" />;
      case "Personal": return <User size={24} className="text-indigo-500" />;
      case "Education": return <BookOpen size={24} className="text-orange-500" />;
      case "Credit Card": return <CreditCard size={24} className="text-pink-500" />;
      default: return <HelpCircle size={24} className="text-slate-500" />;
    }
  };

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Active EMIs</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2" size={18} /> Add EMI
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading EMIs...</div>
        ) : emis.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 flex flex-col items-center">
            <CalendarCheck size={48} className="mb-4 opacity-20" />
            <p>No active EMIs found. You are debt-free!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {emis.map((emi) => {
                const today = new Date();
                const startDate = new Date(emi.startDate);
                const monthsElapsed = differenceInMonths(today, startDate);
                const paidMonths = Math.min(Math.max(monthsElapsed, 0), emi.tenureMonths);
                const remainingMonths = emi.tenureMonths - paidMonths;
                const progressPct = (paidMonths / emi.tenureMonths) * 100;

                // Calculate next due date logically
                let nextDueDate = new Date(today.getFullYear(), today.getMonth(), emi.dueDayOfMonth);
                if (today.getDate() > emi.dueDayOfMonth) {
                  nextDueDate = addMonths(nextDueDate, 1);
                }

                // Check if overdue
                const isOverdue = today.getDate() > emi.dueDayOfMonth;

                return (
                  <motion.div
                    key={emi.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className={cn("h-full flex flex-col relative overflow-hidden", isOverdue && "border-rose-500 shadow-rose-500/20")}>
                      {isOverdue && (
                        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                          OVERDUE
                        </div>
                      )}
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-white/50 dark:bg-black/20">
                              {getLoanIcon(emi.loanType)}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{emi.lenderName}</h3>
                              <p className="text-sm text-slate-500">{emi.loanType} Loan</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">EMI Amount</p>
                            <p className="font-bold text-lg">{formatCurrency(emi.emiAmount, currency)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Total Loan</p>
                            <p className="font-semibold">{formatCurrency(emi.totalLoanAmount, currency)}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-6 flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-medium">{paidMonths} / {emi.tenureMonths} months</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 transition-all duration-1000"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10 dark:border-white/5">
                          <div>
                            <p className="text-xs text-slate-500">Next Due</p>
                            <p className={cn("font-medium text-sm", isOverdue ? "text-rose-500" : "")}>
                              {nextDueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <Button size="sm" onClick={() => handleMarkPaid(emi)}>
                            Mark Paid
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.main>
      <MobileNav />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add New EMI"
      >
        <EmiForm onSuccess={() => { setIsFormOpen(false); loadData(); }} />
      </Modal>
    </>
  );
}
