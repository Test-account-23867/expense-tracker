import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Tv,
  Zap,
  HeartPulse,
  Home,
  BookOpen,
  Sparkles,
  Plane,
  TrendingUp,
  Wallet,
  Briefcase,
  MoreHorizontal
} from 'lucide-react';

export type CategoryKey = string;

export interface CategoryDef {
  name: string;
  icon: any; // Lucide icon
  color: string;
  subcategories: string[];
}

export const CATEGORIES: Record<CategoryKey, CategoryDef> = {
  'Food & Dining': {
    name: 'Food & Dining',
    icon: UtensilsCrossed,
    color: 'text-orange-500',
    subcategories: ['Zomato', 'Swiggy', 'Restaurant', 'Cafe', 'Groceries', 'Home Cooked', 'Others']
  },
  'Transport': {
    name: 'Transport',
    icon: Car,
    color: 'text-blue-500',
    subcategories: ['Uber', 'Rapido', 'Ola', 'Metro', 'Local Train', 'Bus', 'Auto', 'Taxi', 'Fuel', 'Others']
  },
  'Shopping': {
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'text-pink-500',
    subcategories: ['Zepto', 'Blinkit', 'Instamart', 'Amazon Now', 'Flipkart Minutes', 'Amazon', 'Flipkart', 'Myntra', 'Meesho', 'Store / Offline', 'Others']
  },
  'Entertainment': {
    name: 'Entertainment',
    icon: Tv,
    color: 'text-purple-500',
    subcategories: ['Netflix', 'Disney+ Hotstar', 'Amazon Prime Video', 'YouTube Premium', 'Spotify', 'Apple Music', 'JioSaavn', 'Movies / Theatre', 'Others']
  },
  'Bills & Utilities': {
    name: 'Bills & Utilities',
    icon: Zap,
    color: 'text-yellow-500',
    subcategories: ['Electricity', 'Phone / Mobile Recharge', 'Internet / Broadband', 'Credit Card Bill', 'Gas / LPG', 'Water', 'OTT Subscription', 'Insurance Premium', 'Others']
  },
  'Health': {
    name: 'Health',
    icon: HeartPulse,
    color: 'text-red-500',
    subcategories: ['Doctor / Consultation', 'Medicines / Pharmacy', 'Lab Tests', 'Gym / Fitness', 'Yoga / Wellness', 'Hospital', 'Others']
  },
  'Rent & Housing': {
    name: 'Rent & Housing',
    icon: Home,
    color: 'text-teal-500',
    subcategories: ['Rent', 'Maintenance / Society Charges', 'Home Repairs', 'Furniture / Appliances', 'Housekeeping', 'Others']
  },
  'Education': {
    name: 'Education',
    icon: BookOpen,
    color: 'text-indigo-500',
    subcategories: ['Course / Certification', 'Books / Stationery', 'School / College Fees', 'Coaching / Tuition', 'Online Learning (Udemy, Coursera etc.)', 'Others']
  },
  'Personal Care': {
    name: 'Personal Care',
    icon: Sparkles,
    color: 'text-rose-500',
    subcategories: ['Salon / Haircut', 'Skincare', 'Clothing', 'Laundry', 'Others']
  },
  'Travel': {
    name: 'Travel',
    icon: Plane,
    color: 'text-sky-500',
    subcategories: ['Flight', 'Train (IRCTC)', 'Bus (RedBus etc.)', 'Hotel / Stay', 'Cab (outstation)', 'Food (travel)', 'Others']
  },
  'Investments': {
    name: 'Investments',
    icon: TrendingUp,
    color: 'text-green-500',
    subcategories: ['Mutual Funds', 'Stocks / Equity', 'Fixed Deposit', 'PPF / NPS', 'Crypto', 'SIP', 'Gold', 'Others']
  },
  'Salary & Income': {
    name: 'Salary & Income',
    icon: Wallet,
    color: 'text-emerald-500',
    subcategories: ['Monthly Salary', 'Bonus', 'Arrears', 'Others']
  },
  'Freelance & Side Income': {
    name: 'Freelance & Side Income',
    icon: Briefcase,
    color: 'text-cyan-500',
    subcategories: ['Project Payment', 'Consulting', 'Content Creation', 'Part-time', 'Others']
  },
  'Miscellaneous': {
    name: 'Miscellaneous',
    icon: MoreHorizontal,
    color: 'text-gray-500',
    subcategories: ['Gift', 'Donation', 'Festival / Occasion', 'ATM Withdrawal', 'Others']
  }
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES);
