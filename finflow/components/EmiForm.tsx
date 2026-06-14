"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select } from "./Select";
import { createEMI } from "@/lib/actions";
import toast from "react-hot-toast";

const formSchema = z.object({
  lenderName: z.string().min(1, "Lender name is required"),
  loanType: z.enum(["Home", "Car", "Personal", "Education", "Credit Card", "Other"]),
  totalLoanAmount: z.number().positive(),
  emiAmount: z.number().positive(),
  startDate: z.string(),
  tenureMonths: z.number().positive(),
  dueDayOfMonth: z.number().min(1).max(31),
});

type FormValues = z.infer<typeof formSchema>;

export function EmiForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanType: "Personal",
      startDate: new Date().toISOString().split('T')[0],
      dueDayOfMonth: 5
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createEMI({
        ...data,
        startDate: new Date(data.startDate),
      });
      toast.success("EMI added successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to add EMI.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Lender Name</label>
        <Input {...register("lenderName")} />
        {errors.lenderName && <p className="text-red-500 text-xs">{errors.lenderName.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Loan Type</label>
        <Select {...register("loanType")}>
          <option value="Home">Home</option>
          <option value="Car">Car</option>
          <option value="Personal">Personal</option>
          <option value="Education">Education</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Other">Other</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Total Amount</label>
          <Input type="number" step="0.01" {...register("totalLoanAmount", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">EMI Amount</label>
          <Input type="number" step="0.01" {...register("emiAmount", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Start Date</label>
          <Input type="date" {...register("startDate")} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Tenure (Months)</label>
          <Input type="number" {...register("tenureMonths", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Due Day of Month (1-31)</label>
        <Input type="number" min="1" max="31" {...register("dueDayOfMonth", { valueAsNumber: true })} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add EMI"}
      </Button>
    </form>
  );
}
