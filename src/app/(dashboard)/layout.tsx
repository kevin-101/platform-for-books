import DashboardSideNav from "@/components/DashboardSideNav";
import MobileNav from "@/components/MobileNav";
import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // TODO: include AddBookButton in this layout
  // and hide it in the profile page

  return (
    <div className="w-full min-h-[100dvh] flex flex-col lg:flex-row">
      <DashboardSideNav />
      <MobileNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
