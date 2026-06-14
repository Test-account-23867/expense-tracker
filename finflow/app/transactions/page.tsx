"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Modal } from "@/components/Modal";
import { TransactionForm } from "@/components/TransactionForm";
import { getTransactions, deleteTransaction } from "@/lib/actions";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Plus, Search, Trash2, Edit2, ReceiptText } from "lucide-react";
import { CATEGORY_NAMES } from "@/lib/categories";
import { useCurrency } from "@/components/CurrencyProvider";

export default function TransactionsPage() {
  const { currency } = useCurrency();
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const loadData = async () => {
    setLoading(true);
    const data = await getTransactions();
    setTxs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id);
      loadData();
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTxs = useMemo(() => {
    return txs.filter((tx) => {
      const matchSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter ? tx.type === typeFilter : true;
      const matchCategory = categoryFilter ? tx.category === categoryFilter : true;
      return matchSearch && matchType && matchCategory;
    });
  }, [txs, searchTerm, typeFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);
  const paginatedTxs = filteredTxs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, categoryFilter]);

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <Button onClick={() => { setEditingTx(null); setIsFormOpen(true); }}>
            <Plus className="mr-2" size={18} /> Add Transaction
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Search description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 flex-1">
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </Select>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORY_NAMES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading transactions...</div>
            ) : filteredTxs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <ReceiptText size={48} className="mb-4 opacity-20" />
                <p>No transactions found.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-white/5 dark:bg-black/20 border-b border-white/20 dark:border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Description</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginatedTxs.map((tx) => (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="border-b border-white/10 dark:border-white/5 last:border-0 hover:bg-white/5 dark:hover:bg-black/10 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(tx.date)}</td>
                        <td className="px-6 py-4 font-medium">{tx.description}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span>{tx.category}</span>
                            <span className="text-xs text-slate-500">
                              {tx.subcategory === 'Others' ? tx.subcategoryCustom : tx.subcategory}
                            </span>
                          </div>
                        </td>
                        <td className={cn(
                          "px-6 py-4 text-right font-semibold whitespace-nowrap",
                          tx.type === "INCOME" ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount, currency)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => { setEditingTx(tx); setIsFormOpen(true); }}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-2 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t border-white/20 dark:border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </Card>

      </motion.main>
      <MobileNav />

      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTx(null); }}
        title={editingTx ? "Edit Transaction" : "Add Transaction"}
      >
        <TransactionForm
          initialData={editingTx}
          onSuccess={() => { setIsFormOpen(false); loadData(); }}
        />
      </Modal>
    </>
  );
}
