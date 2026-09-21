import clsx from "clsx";
import { Ban, Circle, DatabaseZap, ExternalLink, Skull, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { Lift } from "@/components/motion";
import type { RunStatus } from "@/types/database";

const statusConfig = {
  active: { label: "EN CURSO", className: "bg-[#16341f]/80 text-[#8af0a2] border-[#387548]", icon: Circle },
  failed: { label: "FALLIDO", className: "bg-[#3a171a]/85 text-[#ff8589] border-[#713139]", icon: Skull },
  completed: { label: "COMPLETADO", className: "bg-[#392f16]/85 text-[#ffdb7e] border-[#75602b]", icon: Trophy },
  cancelled: { label: "CANCELADO", className: "bg-[#222723]/85 text-[#abb4ae] border-[#465048]", icon: Ban },
} satisfies Record<RunStatus, { label: string; className: string; icon: typeof Circle }>;

export function StatusBadge({ status }: { status: RunStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[.68rem] font-extrabold tracking-[.13em] backdrop-blur-md", config.className)}>
      <Icon size={12} fill={status === "active" ? "currentColor" : "none"} strokeWidth={2.4} />
      {config.label}
    </span>
  );
}

export function StatCard({ label, value, detail, accent = "green" }: { label: string; value: ReactNode; detail?: ReactNode; accent?: "green" | "red" | "gold" }) {
  return (
    <Lift>
      <article className="panel panel-interactive h-full overflow-hidden p-5">
        <span className={clsx("absolute left-5 top-0 h-[3px] w-12", accent === "green" && "bg-[#68df84]", accent === "red" && "bg-[#f45e64]", accent === "gold" && "bg-[#edbf59]")} />
        <p className="mb-3 text-[.68rem] font-bold uppercase tracking-[.15em] text-[#849188]">{label}</p>
        <div className="stat-value">{value}</div>
        {detail && <div className="mt-2 text-sm text-[#859188]">{detail}</div>}
      </article>
    </Lift>
  );
}

export function DemoBanner({ error }: { error?: string }) {
  return (
    <div className="glass-shell mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm text-[#f4d484]">
      <span className="flex items-center gap-2"><DatabaseZap size={17} /><span><strong>Modo demostración.</strong> {error ?? "Conecta Supabase para guardar cambios."}</span></span>
      <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-bold text-[#ffe091]">Abrir Supabase <ExternalLink size={14} /></a>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="panel grid min-h-52 place-items-center p-8 text-center text-[#8d9c92]">{children}</div>;
}
