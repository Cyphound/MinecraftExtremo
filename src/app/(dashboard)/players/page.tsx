import Link from "next/link";
import { CalendarDays, CircleUserRound, Link2, UsersRound } from "lucide-react";
import { PlayerRegistrationForm } from "@/components/forms";
import { EmptyState, DemoBanner } from "@/components/ui";
import { getAppData } from "@/lib/data";
import { formatDate, initials } from "@/lib/format";

export const dynamic = "force-dynamic";

function PlayerMark({ name }: { name: string }) {
  return <span className="display-font grid size-14 place-items-center rounded-2xl border border-[#6f568d] bg-[linear-gradient(145deg,#2b2038,#15101d)] text-lg font-bold text-[#d7bdff] shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">{initials(name)}</span>;
}

export default async function PlayersPage() {
  const data = await getAppData();
  return <>
    {data.isDemo && <DemoBanner error={data.error}/>} 
    <header className="mb-7">
      <p className="eyebrow">Control del escuadrón</p>
      <h1 className="display-font mt-2 text-4xl font-bold tracking-tight">Jugadores del Realm</h1>
      <p className="muted mt-2 max-w-2xl">Registra los perfiles que compartirán cada mundo. No son cuentas: solo la identidad que aparece en la bitácora.</p>
    </header>

    <div className="grid gap-6 lg:grid-cols-[.78fr_1.22fr]">
      <section className="panel biome-section biome-nether p-5 sm:p-6">
        <p className="eyebrow">Nuevo perfil</p>
        <h2 className="display-font mt-2 text-2xl font-bold tracking-tight">Añadir jugador</h2>
        <p className="muted mt-2 mb-6 text-sm leading-relaxed">Empieza con los tres integrantes del equipo. Puedes dejar nickname y avatar para después.</p>
        <PlayerRegistrationForm disabled={data.isDemo}/>
      </section>

      <section className="panel biome-section biome-overworld p-5 sm:p-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="eyebrow">Roster actual</p><h2 className="display-font mt-2 text-2xl font-bold tracking-tight">{data.players.length ? `${data.players.length} jugador${data.players.length === 1 ? "" : "es"} registrado${data.players.length === 1 ? "" : "s"}` : "Realm sin jugadores"}</h2></div>
          <span className="grid size-11 place-items-center rounded-2xl border border-[#5c4f77] bg-[#1d1830] text-[#bca6ff]"><UsersRound size={20}/></span>
        </div>
        {data.players.length === 0 ? <EmptyState><div className="grid place-items-center gap-3"><CircleUserRound size={28} className="text-[#a985ff]"/><span>La base está limpia. Registra el primer perfil para comenzar.</span></div></EmptyState> : <div className="grid gap-3 sm:grid-cols-2">{data.players.map((player) => <article key={player.id} className="panel panel-interactive p-4"><div className="flex items-center gap-3"><PlayerMark name={player.name}/><div className="min-w-0"><h3 className="display-font truncate text-lg font-bold">{player.name}</h3><p className="truncate text-sm text-[#8b8296]">{player.nickname || "Sin nickname"}</p></div></div><div className="mt-4 grid gap-2 border-t border-white/8 pt-3 text-xs text-[#82798c]"><span className="flex items-center gap-2"><CalendarDays size={14} className="text-[#9fc6ff]"/> Registrado {formatDate(player.created_at)}</span>{player.avatar_url && <Link href={player.avatar_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#c3a7ff] hover:text-[#dfcfff]"><Link2 size={14}/> Ver avatar</Link>}</div></article>)}</div>}
      </section>
    </div>
  </>;
}
