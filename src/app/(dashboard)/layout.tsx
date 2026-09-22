import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AutoRefresh } from "@/components/auto-refresh";
import { Nav } from "@/components/nav";
import { hasValidSession } from "@/lib/auth";
import { getAppData } from "@/lib/data";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!(await hasValidSession())) redirect("/login");
  const data = await getAppData();
  const totalDeaths = data.runs.filter((run) => run.status === "failed").length;
  const currentTry = data.runs.find((run) => run.status === "active")?.try_number ?? data.runs[0]?.try_number ?? null;
  return <div className="app-shell"><AutoRefresh interval={3000}/><Nav totalDeaths={totalDeaths} currentTry={currentTry}/><div className="app-stage"><main className="content-stage">{children}</main><footer className="app-footer">Hardcore Realm Log · tres jugadores, un solo mundo</footer></div></div>;
}
