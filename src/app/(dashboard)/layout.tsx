import DashboardSideNav from "@/components/DashboardSideNav";
import MobileNav from "@/components/MobileNav";
import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="w-full min-h-[100dvh] flex flex-col lg:flex-row">
      <DashboardSideNav />
      <MobileNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
