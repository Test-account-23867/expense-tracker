"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select } from "./Select";
import { CATEGORIES, CATEGORY_NAMES } from "@/lib/categories";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { createTransaction, updateTransaction } from "@/lib/actions";
import toast from "react-hot-toast";

const formSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  subcategoryCustom: z.string().optional(),
  date: z.string(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function TransactionForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: any }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: new Date(initialData.date).toISOString().split('T')[0],
      amount: Number(initialData.amount)
    } : {
      type: "EXPENSE",
      amount: undefined,
      description: "",
      category: "",
      subcategory: "",
      subcategoryCustom: "",
      date: new Date().toISOString().split('T')[0],
      notes: ""
    }
  });

  const selectedCategory = watch("category");
  const selectedSubcategory = watch("subcategory");

  // Reset subcategory when category changes
  useEffect(() => {
    if (!initialData || (initialData && initialData.category !== selectedCategory)) {
      setValue("subcategory", "");
      setValue("subcategoryCustom", "");
    }
  }, [selectedCategory, setValue, initialData]);

  const subcategories = selectedCategory ? CATEGORIES[selectedCategory]?.subcategories || [] : [];
  const showCustomSubcategory = selectedSubcategory === "Others";

  const onSubmit = async (data: FormValues) => {
    try {
      if (initialData) {
        await updateTransaction(initialData.id, {
          ...data,
          date: new Date(data.date),
        });
        toast.success("Transaction updated!");
      } else {
        await createTransaction({
          ...data,
          date: new Date(data.date),
        });
        toast.success("Transaction added!");
      }
      onSuccess();
    } catch (error) {
      toast.error("Failed to save transaction.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex gap-4">
        <label className="flex-1 cursor-pointer">
          <input type="radio" value="EXPENSE" {...register("type")} className="peer sr-only" />
          <div className="rounded-xl border border-white/20 dark:border-white/10 px-4 py-3 text-center transition-colors peer-checked:bg-rose-500 peer-checked:text-white peer-checked:border-rose-500 glass-panel">
            Expense
          </div>
        </label>
        <label className="flex-1 cursor-pointer">
          <input type="radio" value="INCOME" {...register("type")} className="peer sr-only" />
          <div className="rounded-xl border border-white/20 dark:border-white/10 px-4 py-3 text-center transition-colors peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-500 glass-panel">
            Income
          </div>
        </label>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Amount</label>
        <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
        {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Description</label>
        <Input {...register("description")} />
        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Date</label>
        <Input type="date" {...register("date")} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Category</label>
        <Select {...register("category")}>
          <option value="">Select Category</option>
          {CATEGORY_NAMES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
        {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
      </div>

      <AnimatePresence>
        {subcategories.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-1 overflow-hidden"
          >
            <label className="text-sm font-medium">Subcategory</label>
            <Select {...register("subcategory")}>
              <option value="">Select Subcategory (Optional)</option>
              {subcategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </Select>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCustomSubcategory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-1 overflow-hidden"
          >
            <label className="text-sm font-medium text-indigo-500">Specify</label>
            <Input {...register("subcategoryCustom")} placeholder="Type specific details..." className="border-indigo-500/50 focus-visible:ring-indigo-500" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1">
        <label className="text-sm font-medium">Notes (Optional)</label>
        <textarea
          {...register("notes")}
          className="flex min-h-[80px] w-full rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/20 px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-md shadow-inner transition-colors"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : initialData ? "Update Transaction" : "Add Transaction"}
      </Button>
    </form>
  );
}
