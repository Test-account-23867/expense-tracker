"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { DueForm } from "@/components/DueForm";
import { getDues, markDuePaid } from "@/lib/actions";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Plus, WalletCards, ArrowUpRight, ArrowDownLeft, AlertCircle } from "lucide-react";
import { useCurrency } from "@/components/CurrencyProvider";
import toast from "react-hot-toast";

export default function DuesPage() {
  const { currency } = useCurrency();
  const [dues, setDues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"I_OWE" | "OWED_TO_ME">("I_OWE");

  // Partial payment state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    const data = await getDues();
    setDues(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePayment = async () => {
    if (!selectedDue || paymentAmount <= 0) return;
    try {
      const isFullPayment = paymentAmount >= selectedDue.amount;
      await markDuePaid(selectedDue.id, paymentAmount, isFullPayment);
      toast.success("Payment recorded successfully!");
      setPaymentModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Failed to record payment.");
    }
  };

  const filteredDues = dues.filter(d => d.type === activeTab && d.status !== "PAID")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()); // Sort closest due first

  // Summary logic
  const totalOwedByMe = dues.filter(d => d.type === "I_OWE" && d.status !== "PAID").reduce((sum, d) => sum + d.amount, 0);
  const totalOwedToMe = dues.filter(d => d.type === "OWED_TO_ME" && d.status !== "PAID").reduce((sum, d) => sum + d.amount, 0);
  const netPosition = totalOwedToMe - totalOwedByMe;

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dues & Receivables</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2" size={18} /> Add Entry
          </Button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-rose-500/10 border-rose-500/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-500 font-medium">Total I Owe</p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalOwedByMe, currency)}</p>
              </div>
              <ArrowUpRight size={32} className="text-rose-500 opacity-50" />
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-500 font-medium">Total Owed to Me</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalOwedToMe, currency)}</p>
              </div>
              <ArrowDownLeft size={32} className="text-emerald-500 opacity-50" />
            </CardContent>
          </Card>
          <Card className={netPosition >= 0 ? "bg-indigo-500/10 border-indigo-500/20" : "bg-orange-500/10 border-orange-500/20"}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", netPosition >= 0 ? "text-indigo-500" : "text-orange-500")}>Net Position</p>
                <p className={cn("text-2xl font-bold", netPosition >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-orange-600 dark:text-orange-400")}>
                  {netPosition >= 0 ? "+" : ""}{formatCurrency(netPosition, currency)}
                </p>
              </div>
              <WalletCards size={32} className={cn("opacity-50", netPosition >= 0 ? "text-indigo-500" : "text-orange-500")} />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex p-1 space-x-1 glass-panel rounded-xl w-full max-w-md mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab("I_OWE")}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === "I_OWE" ? "bg-white/50 dark:bg-black/30 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            I Owe
          </button>
          <button
            onClick={() => setActiveTab("OWED_TO_ME")}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === "OWED_TO_ME" ? "bg-white/50 dark:bg-black/30 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Owed to Me
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading dues...</div>
        ) : filteredDues.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 flex flex-col items-center">
            <WalletCards size={48} className="mb-4 opacity-20" />
            <p>No pending entries here.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredDues.map((due) => {
                const isOverdue = new Date(due.dueDate) < new Date();

                return (
                  <motion.div
                    key={due.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className={cn("overflow-hidden transition-all", isOverdue && "border-rose-500/50 dark:border-rose-500/50 shadow-rose-500/10")}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{due.name}</h3>
                          <div className={cn(
                            "text-lg font-bold",
                            due.type === "I_OWE" ? "text-rose-500" : "text-emerald-500"
                          )}>
                            {formatCurrency(due.amount, currency)}
                          </div>
                        </div>
                        {due.description && <p className="text-sm text-slate-500 mb-4">{due.description}</p>}

                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10 dark:border-white/5">
                          <div className="flex items-center gap-2">
                            {isOverdue && <AlertCircle size={16} className="text-rose-500" />}
                            <div>
                              <p className="text-xs text-slate-500">Due Date</p>
                              <p className={cn("font-medium text-sm", isOverdue ? "text-rose-500" : "")}>
                                {formatDate(due.dueDate)}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => {
                            setSelectedDue(due);
                            setPaymentAmount(due.amount);
                            setPaymentModalOpen(true);
                          }}>
                            {due.type === "I_OWE" ? "Pay Now" : "Receive"}
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

      {/* Add Due Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add Due Entry">
        <DueForm onSuccess={() => { setIsFormOpen(false); loadData(); }} />
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Record Payment">
        {selectedDue && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              {selectedDue.type === "I_OWE" ? `Paying to ${selectedDue.name}` : `Receiving from ${selectedDue.name}`}
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="flex h-11 w-full rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 backdrop-blur-md transition-colors"
              />
              <p className="text-xs text-slate-500">Total remaining: {formatCurrency(selectedDue.amount, currency)}</p>
            </div>
            <Button onClick={handlePayment} className="w-full">Confirm Payment</Button>
          </div>
        )}
      </Modal>
    </>
  );
}
