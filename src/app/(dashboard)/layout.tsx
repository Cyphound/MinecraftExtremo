import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Nav } from "@/components/nav";
import { hasValidSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!(await hasValidSession())) redirect("/login");
  return <><Nav/><main className="container-app py-7 sm:py-10">{children}</main><footer className="container-app border-t border-[#1d251f] py-8 text-center text-xs text-[#59645d]">Minecraft Extremo Tracker · construido para sobrevivir juntos</footer></>;
}
