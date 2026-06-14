"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select } from "./Select";
import { CATEGORY_NAMES } from "@/lib/categories";
import { createBudget } from "@/lib/actions";

const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  limit: z.number().positive("Limit must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export function BudgetForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createBudget(data);
      onSuccess();
    } catch (e) {
      console.error(e);
      // Ideally handle unique constraint error for duplicate categories
      alert("Failed to create budget. This category might already have a budget.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <div className="space-y-1">
        <label className="text-sm font-medium">Monthly Limit</label>
        <Input type="number" step="0.01" {...register("limit", { valueAsNumber: true })} />
        {errors.limit && <p className="text-red-500 text-xs">{errors.limit.message}</p>}
      </div>

      <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Set Budget"}
      </Button>
    </form>
  );
}
