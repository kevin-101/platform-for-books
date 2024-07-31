import Link from "next/link";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import NavLinks from "./NavLinks";
import NavFooter from "./NavFooter";
import { Suspense } from "react";

type DashboardSideNavProps = {
  className?: ClassValue;
};

export default function DashboardSideNav({ className }: DashboardSideNavProps) {
  return (
    <nav
      className={cn(
        "sticky top-0 h-screen p-4 hidden lg:flex items-start justify-between gap-2 flex-col w-96 border-r border-orange-200 bg-orange-50",
        className
      )}
    >
      <Link
        href="/dashboard"
        className="text-3xl font-bold hidden lg:block mb-10"
      >
        Dashboard
      </Link>

      <div className="hidden lg:flex flex-col flex-1 gap-12 items-start w-full overflow-auto">
        <NavLinks />
      </div>

      <NavFooter />
    </nav>
  );
}
