import { PrismaClient } from '@prisma/client';
import { subDays, subMonths } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const txCount = await prisma.transaction.count();
  if (txCount > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  const today = new Date();

  const transactionsData = [
    { type: 'INCOME', amount: 85000, description: 'Monthly Salary', category: 'Salary & Income', subcategory: 'Monthly Salary', date: subDays(today, 2) },
    { type: 'INCOME', amount: 15000, description: 'Freelance Project', category: 'Freelance & Side Income', subcategory: 'Project Payment', date: subDays(today, 15) },
    { type: 'INCOME', amount: 85000, description: 'Monthly Salary', category: 'Salary & Income', subcategory: 'Monthly Salary', date: subMonths(subDays(today, 2), 1) },
    { type: 'INCOME', amount: 85000, description: 'Monthly Salary', category: 'Salary & Income', subcategory: 'Monthly Salary', date: subMonths(subDays(today, 2), 2) },

    { type: 'EXPENSE', amount: 450, description: 'Zomato Dinner', category: 'Food & Dining', subcategory: 'Zomato', date: subDays(today, 1) },
    { type: 'EXPENSE', amount: 2500, description: 'Groceries', category: 'Food & Dining', subcategory: 'Groceries', date: subDays(today, 5) },
    { type: 'EXPENSE', amount: 1200, description: 'Cafe with friends', category: 'Food & Dining', subcategory: 'Cafe', date: subDays(today, 10) },

    { type: 'EXPENSE', amount: 350, description: 'Uber to office', category: 'Transport', subcategory: 'Uber', date: subDays(today, 3) },
    { type: 'EXPENSE', amount: 2000, description: 'Fuel', category: 'Transport', subcategory: 'Fuel', date: subDays(today, 12) },

    { type: 'EXPENSE', amount: 1500, description: 'Electricity Bill', category: 'Bills & Utilities', subcategory: 'Electricity', date: subDays(today, 8) },
    { type: 'EXPENSE', amount: 899, description: 'Broadband', category: 'Bills & Utilities', subcategory: 'Internet / Broadband', date: subDays(today, 20) },

    { type: 'EXPENSE', amount: 25000, description: 'Monthly Rent', category: 'Rent & Housing', subcategory: 'Rent', date: subDays(today, 28) },
    { type: 'EXPENSE', amount: 25000, description: 'Monthly Rent', category: 'Rent & Housing', subcategory: 'Rent', date: subMonths(subDays(today, 28), 1) },
    { type: 'EXPENSE', amount: 25000, description: 'Monthly Rent', category: 'Rent & Housing', subcategory: 'Rent', date: subMonths(subDays(today, 28), 2) },

    { type: 'EXPENSE', amount: 3500, description: 'Amazon Shoes', category: 'Shopping', subcategory: 'Amazon', date: subDays(today, 18) },

    { type: 'EXPENSE', amount: 500, description: 'Donation', category: 'Miscellaneous', subcategory: 'Others', subcategoryCustom: 'Local NGO', date: subDays(today, 4) }
  ];

  for (const tx of transactionsData) {
    await prisma.transaction.create({ data: tx });
  }

  const emiCount = await prisma.eMI.count();
  if (emiCount === 0) {
    await prisma.eMI.createMany({
      data: [
        {
          lenderName: 'HDFC Bank',
          loanType: 'Car',
          totalLoanAmount: 600000,
          emiAmount: 12500,
          startDate: subMonths(today, 10),
          tenureMonths: 60,
          dueDayOfMonth: 5
        },
        {
          lenderName: 'SBI',
          loanType: 'Personal',
          totalLoanAmount: 200000,
          emiAmount: 8500,
          startDate: subMonths(today, 3),
          tenureMonths: 24,
          dueDayOfMonth: 15
        }
      ]
    });
  }

  const duesCount = await prisma.due.count();
  if (duesCount === 0) {
    await prisma.due.createMany({
      data: [
        {
          type: 'OWED_TO_ME',
          name: 'Rahul',
          amount: 5000,
          dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
          description: 'Trip expenses'
        },
        {
          type: 'I_OWE',
          name: 'Amit',
          amount: 2000,
          dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
          description: 'Dinner bill'
        }
      ]
    });
  }

  const budgetCount = await prisma.budget.count();
  if (budgetCount === 0) {
    await prisma.budget.createMany({
      data: [
        { category: 'Food & Dining', limit: 8000 },
        { category: 'Transport', limit: 4000 },
        { category: 'Shopping', limit: 5000 },
        { category: 'Bills & Utilities', limit: 3000 }
      ]
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
