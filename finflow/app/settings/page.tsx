"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Download, Trash2, Settings as SettingsIcon } from "lucide-react";
import { getAllTransactions, getEMIs, getDues, getBudgets, getSettings, updateSettings, wipeData } from "@/lib/actions";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("Finflow User");
  const [currency, setCurrency] = useState("INR");
  const [budgetResetDay, setBudgetResetDay] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const s = await getSettings();
      if (s) {
        setDisplayName(s.displayName);
        setCurrency(s.currency);
        setBudgetResetDay(s.budgetResetDay);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateSettings({
        displayName,
        currency,
        budgetResetDay: Number(budgetResetDay),
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    const [txs, emis, dues, budgets] = await Promise.all([
      getAllTransactions(), getEMIs(), getDues(), getBudgets()
    ]);
    const data = { transactions: txs, emis, dues, budgets };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finflow_backup_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearData = async () => {
    if (confirm("WARNING: This will permanently delete ALL your data. Are you absolutely sure?")) {
      if (confirm("Double checking: Are you REALLY sure? This action cannot be undone.")) {
        try {
          await wipeData();
          toast.success("All data has been permanently deleted.");
        } catch (error) {
          toast.error("Failed to delete data.");
        }
      }
    }
  };

  if (loading) return null;

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-6"
      >
        <div className="flex items-center gap-3">
          <SettingsIcon size={32} className="text-indigo-500" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage your display and localization settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Display Name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Currency</label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Monthly Budget Reset Day</label>
              <Input type="number" min="1" max="31" value={budgetResetDay} onChange={(e) => setBudgetResetDay(Number(e.target.value))} />
            </div>
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-rose-500/20">
          <CardHeader>
            <CardTitle className="text-rose-500">Data Management</CardTitle>
            <CardDescription>Export your data or wipe your account clean.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 glass-panel bg-white/50 dark:bg-black/20 rounded-xl">
              <div>
                <h4 className="font-medium">Export Data</h4>
                <p className="text-sm text-slate-500">Download a full JSON backup of all your data.</p>
              </div>
              <Button variant="secondary" onClick={handleExportData}>
                <Download size={16} className="mr-2" /> Export JSON
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 glass-panel bg-rose-500/10 border-rose-500/20 rounded-xl">
              <div>
                <h4 className="font-medium text-rose-500">Clear All Data</h4>
                <p className="text-sm text-slate-500">Permanently delete all transactions, EMIs, and budgets.</p>
              </div>
              <Button variant="danger" onClick={handleClearData}>
                <Trash2 size={16} className="mr-2" /> Wipe Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.main>
      <MobileNav />
    </>
  );
}
