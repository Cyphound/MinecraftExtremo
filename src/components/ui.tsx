import clsx from "clsx";
import type { ReactNode } from "react";
import type { RunStatus } from "@/types/database";

export function StatusBadge({ status }: { status: RunStatus }) {
  const config = { active:["EN CURSO","bg-[#173b23] text-[#84efa2] border-[#2f6b40]","●"], failed:["FALLIDO","bg-[#41191c] text-[#ff7f83] border-[#6b2b2f]","☠"], completed:["COMPLETADO","bg-[#3b3014] text-[#ffd975] border-[#6b5928]","★"], cancelled:["CANCELADO","bg-[#242824] text-[#a8b0aa] border-[#424a44]","×"] }[status];
  return <span className={clsx("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black tracking-widest",config[1])}>{config[2]} {config[0]}</span>;
}
export function StatCard({label,value,detail,accent="green"}:{label:string;value:ReactNode;detail?:ReactNode;accent?:"green"|"red"|"gold"}) { return <article className="panel relative overflow-hidden p-5"><span className={clsx("absolute inset-x-0 top-0 h-0.5",accent==="green"&&"bg-[#58c878]",accent==="red"&&"bg-[#ed4b52]",accent==="gold"&&"bg-[#e6b94f]")}/><p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-[#87938b]">{label}</p><div className="stat-value">{value}</div>{detail&&<div className="mt-2 text-sm text-[#8d9c92]">{detail}</div>}</article>; }
export function DemoBanner({error}:{error?:string}) { return <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#5f4f26] bg-[#2d2614] px-4 py-3 text-sm text-[#f7d77f]"><span><strong>Modo demostración.</strong> {error??"Conecta Supabase para guardar cambios."}</span><a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="font-bold underline underline-offset-4">Abrir Supabase</a></div>; }
export function EmptyState({children}:{children:ReactNode}) { return <div className="panel grid min-h-52 place-items-center p-8 text-center text-[#8d9c92]">{children}</div>; }
