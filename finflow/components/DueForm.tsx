"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./Button";
import { Input } from "./Input";
import { createDue } from "@/lib/actions";

const formSchema = z.object({
  type: z.enum(["I_OWE", "OWED_TO_ME"]),
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive(),
  dueDate: z.string(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function DueForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "I_OWE",
      dueDate: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit = async (data: FormValues) => {
    await createDue({
      ...data,
      dueDate: new Date(data.dueDate),
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex gap-4 mb-4">
        <label className="flex-1 cursor-pointer">
          <input type="radio" value="I_OWE" {...register("type")} className="peer sr-only" />
          <div className="rounded-xl border border-white/20 dark:border-white/10 px-4 py-3 text-center transition-colors peer-checked:bg-rose-500 peer-checked:text-white peer-checked:border-rose-500 glass-panel text-sm">
            I Owe
          </div>
        </label>
        <label className="flex-1 cursor-pointer">
          <input type="radio" value="OWED_TO_ME" {...register("type")} className="peer sr-only" />
          <div className="rounded-xl border border-white/20 dark:border-white/10 px-4 py-3 text-center transition-colors peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-500 glass-panel text-sm">
            Owed to Me
          </div>
        </label>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Person / Entity Name</label>
        <Input {...register("name")} />
        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Amount</label>
        <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Due Date</label>
        <Input type="date" {...register("dueDate")} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Description (Optional)</label>
        <Input {...register("description")} />
      </div>

      <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Add Entry"}
      </Button>
    </form>
  );
}
