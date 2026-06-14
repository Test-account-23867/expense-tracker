"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, ReceiptText, CalendarDays, WalletCards, PieChart } from "lucide-react";

const mobileNavItems = [
  { name: "Dash", href: "/", icon: LayoutDashboard },
  { name: "Txns", href: "/transactions", icon: ReceiptText },
  { name: "EMIs", href: "/emis", icon: CalendarDays },
  { name: "Dues", href: "/dues", icon: WalletCards },
  { name: "Budgets", href: "/budgets", icon: PieChart },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-none border-b-0 border-l-0 border-r-0 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 w-8 h-1 bg-indigo-500 rounded-b-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
