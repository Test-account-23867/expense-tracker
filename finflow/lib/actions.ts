"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// --- Transactions ---

export async function getTransactions(
  page: number = 1,
  pageSize: number = 10,
  filters?: { search?: string, type?: string, category?: string }
) {
  const where: any = {};

  if (filters?.search) {
    where.description = { contains: filters.search, mode: "insensitive" };
  }
  if (filters?.type) {
    where.type = filters.type;
  }
  if (filters?.category) {
    where.category = filters.category;
  }

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where })
  ]);

  return { transactions, totalCount };
}

export async function getAllTransactions() {
  return await prisma.transaction.findMany({
    orderBy: { date: "desc" },
  });
}

export async function createTransaction(data: any) {
  const tx = await prisma.transaction.create({ data });
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/reports");
  return tx;
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/reports");
}

export async function updateTransaction(id: string, data: any) {
  const tx = await prisma.transaction.update({
    where: { id },
    data,
  });
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/reports");
  return tx;
}

// --- EMIs ---

export async function getEMIs() {
  return await prisma.eMI.findMany({
    orderBy: { startDate: "desc" },
  });
}

export async function createEMI(data: any) {
  const emi = await prisma.eMI.create({ data });
  revalidatePath("/emis");
  return emi;
}

export async function markEmiPaid(id: string, amount: number, lenderName: string) {
  await prisma.transaction.create({
    data: {
      type: "EXPENSE",
      amount,
      description: `EMI Payment: ${lenderName}`,
      category: "Bills & Utilities",
      subcategory: "Others",
      date: new Date(),
    }
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/emis");
}

// --- Dues ---

export async function getDues() {
  return await prisma.due.findMany({
    orderBy: { dueDate: "asc" },
  });
}

export async function createDue(data: any) {
  const due = await prisma.due.create({ data });
  revalidatePath("/dues");
  return due;
}

export async function markDuePaid(id: string, amount: number, isFullPayment: boolean) {
  const due = await prisma.due.findUnique({ where: { id } });
  if (!due) return;

  if (isFullPayment) {
    await prisma.due.update({
      where: { id },
      data: { status: "PAID" }
    });
  } else {
    await prisma.due.update({
      where: { id },
      data: { status: "PARTIAL" }
    });
  }

  await prisma.transaction.create({
    data: {
      type: due.type === "OWED_TO_ME" ? "INCOME" : "EXPENSE",
      amount,
      description: `Due Settlement: ${due.name}`,
      category: "Miscellaneous",
      subcategory: "Others",
      date: new Date(),
    }
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/dues");
}

// --- Budgets ---

export async function getBudgets() {
  return await prisma.budget.findMany();
}

export async function wipeData() {
  await prisma.transaction.deleteMany();
  await prisma.eMI.deleteMany();
  await prisma.due.deleteMany();
  await prisma.budget.deleteMany();
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/emis");
  revalidatePath("/dues");
  revalidatePath("/budgets");
  revalidatePath("/reports");
}

export async function createBudget(data: any) {
  const budget = await prisma.budget.create({ data });
  revalidatePath("/budgets");
  return budget;
}

export async function getSettings() {
  let s = await prisma.settings.findUnique({ where: { id: "global" } });
  if (!s) s = await prisma.settings.create({ data: { id: "global" } });
  return s;
}

export async function updateSettings(data: any) {
  const s = await prisma.settings.upsert({ where: { id: "global" }, update: data, create: { id: "global", ...data } });
  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/reports");
  revalidatePath("/transactions");
  revalidatePath("/emis");
  revalidatePath("/dues");
  revalidatePath("/budgets");
  return s;
}
