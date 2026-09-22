import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Flame, Gem, Mountain, ShieldAlert, Skull, Trophy, Waves } from "lucide-react";
import { cancelRunAction, completeRunAction, startNextRunAction } from "@/app/actions";
import { BiomeLegend, RealmMark } from "@/components/brand";
import { DeathDialog } from "@/components/forms";
import { ElapsedTime } from "@/components/elapsed-time";
import { Lift, Reveal } from "@/components/motion";
import { StatCard, StatusBadge } from "@/components/ui";
import { formatDuration, initials } from "@/lib/format";
import { globalStats, playerStats } from "@/lib/stats";
import type { Player, Punishment, Run } from "@/types/database";

function Avatar({ player }: { player: Player }) {
  return player.avatar_url ? (
    <Image src={player.avatar_url} alt="" width={56} height={56} className="size-14 rounded-xl object-cover ring-1 ring-white/10" />
  ) : (
    <span className="display-font grid size-14 place-items-center rounded-xl border border-[#6f568d] bg-[linear-gradient(145deg,#2b2038,#15101d)] font-bold text-[#d7bdff] shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
      {initials(player.name)}
    </span>
  );
}

export function DashboardHero({ current, players, isDemo }: { current: Run | null; players: Player[]; isDemo: boolean }) {
  return (
    <Reveal>
      <section className={`obsidian-panel relative mb-8 overflow-hidden rounded-[1.7rem] p-6 sm:p-9 lg:p-10 ${current?.status === "completed" ? "gold-glow" : ""}`}>
        <div className="world-strata"><span /><span /><span /></div>
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <RealmMark />
              <div>
                <p className="eyebrow">Hardcore Realm</p>
                <BiomeLegend />
              </div>
            </div>
            <h1 className="mc-title pixel-shadow max-w-3xl text-5xl leading-[.88] sm:text-7xl lg:text-[5.6rem]">
              MINECRAFT <strong>EXTREMO</strong>
            </h1>
            {current ? (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="display-font text-2xl font-bold tracking-[-.04em] sm:text-3xl">TRY #{current.try_number.toString().padStart(2, "0")}</span>
                <StatusBadge status={current.status} />
                {current.status === "active" && <ElapsedTime startedAt={current.started_at} className="glass-shell rounded-full px-3 py-1 font-mono text-sm text-[#d9cfdf]" />}
              </div>
            ) : <p className="muted mt-5">Todavía no hay TRYs registrados.</p>}
          </div>
          <div className="flex flex-wrap gap-3 lg:max-w-md lg:justify-end">
            {current?.status === "active" ? (
              <>
                <DeathDialog players={players} disabled={isDemo} />
                <form action={completeRunAction}><button disabled={isDemo} className="btn btn-gold"><Trophy size={18} /> COMPLETAMOS EL JUEGO</button></form>
                <form action={cancelRunAction}><button disabled={isDemo} className="btn btn-ghost text-sm">Cancelar TRY</button></form>
              </>
            ) : (
              <form action={startNextRunAction}><button disabled={isDemo} className="btn btn-primary px-7"><Flame size={18} /> INICIAR SIGUIENTE TRY</button></form>
            )}
          </div>
        </div>
        <p className="hardcore-rule relative mt-8">Si uno cae, el mundo termina para todos</p>
      </section>
    </Reveal>
  );
}

export function PlayerCards({ players, runs }: { players: Player[]; runs: Run[] }) {
  return (
    <Reveal className="panel biome-section biome-overworld mb-9 p-5 sm:p-6" delay={0.04}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><p className="eyebrow">El escuadrón</p><h2 className="display-font mt-2 text-2xl font-bold tracking-tight">Tres vidas, un solo mundo</h2></div>
        <span className="hidden text-xs text-[#756d80] sm:block">racha calculada desde el último fallo</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {players.map((player, index) => {
          const stats = playerStats(player, runs);
          return (
            <Lift key={player.id}>
              <article className="panel panel-interactive h-full overflow-hidden p-5">
                <span className={`absolute inset-x-0 top-0 h-[3px] ${index === 0 ? "bg-[#8eb9ff]" : index === 1 ? "bg-[#d781ff]" : "bg-[#aa8cff]"}`} />
                <div className="mb-5 flex items-center gap-3"><Avatar player={player} /><div><h3 className="display-font text-lg font-bold">{player.name}</h3><p className="text-sm text-[#81798b]">{player.nickname ?? "Sin nickname"}</p></div></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="display-font flex items-center gap-2 text-2xl font-bold text-[#d88cff]"><Skull size={21} />{stats.deaths}</p><p className="text-xs text-[#81798b]">muertes · {stats.percentage}%</p></div>
                  <div><p className="display-font text-2xl font-bold text-[#bda7ff]">{stats.currentStreak}</p><p className="text-xs text-[#81798b]">TRYs de racha</p></div>
                </div>
                <div className="mt-5 grid grid-cols-3 divide-x divide-white/8 border-t border-white/8 pt-4 text-center text-xs">
                  <div><Mountain size={14} className="mx-auto mb-1 text-[#91b8ff]" /><strong>{stats.overworld}</strong><span className="block text-[#766e80]">Overworld</span></div>
                  <div><Flame size={14} className="mx-auto mb-1 text-[#d77bff]" /><strong>{stats.nether}</strong><span className="block text-[#766e80]">Nether</span></div>
                  <div><Waves size={14} className="mx-auto mb-1 text-[#bca6ff]" /><strong>{stats.end}</strong><span className="block text-[#766e80]">The End</span></div>
                </div>
              </article>
            </Lift>
          );
        })}
      </div>
    </Reveal>
  );
}

export function GlobalCards({ runs, players }: { runs: Run[]; players: Player[] }) {
  const s = globalStats(runs, players);
  return (
    <Reveal className="panel biome-section biome-nether mb-9 p-5 sm:p-6" delay={0.06}>
      <p className="eyebrow">Mapa del recorrido</p>
      <h2 className="display-font mb-4 mt-2 text-2xl font-bold tracking-tight">La expedición en números</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="TRYs totales" value={s.totalRuns} />
        <StatCard label="Muertes" value={s.totalDeaths} accent="amethyst" />
        <StatCard label="Mejor progreso" value={s.bestProgress} accent="blue" />
        <StatCard label="Tiempo jugado" value={formatDuration(s.totalDuration)} />
        <StatCard label="TRY más largo" value={formatDuration(s.longest?.duration_seconds)} detail={s.longest ? `TRY #${s.longest.try_number}` : "—"} />
        <StatCard label="TRY más corto" value={formatDuration(s.shortest?.duration_seconds)} detail={s.shortest ? `TRY #${s.shortest.try_number}` : "—"} accent="amethyst" />
        <StatCard label="Llegadas al Nether" value={s.netherReached} />
        <StatCard label="Victorias" value={s.victories} accent="blue" />
      </div>
    </Reveal>
  );
}

export function PunishmentAlert({ punishment, runs }: { punishment: Punishment; runs: Run[] }) {
  const involved = punishment.run_ids.map((id) => runs.find((run) => run.id === id)).filter(Boolean) as Run[];
  return (
    <Reveal>
      <section className="panel biome-section biome-end danger-glow mb-9 overflow-hidden border-[#6e4888] bg-[linear-gradient(125deg,rgba(77,37,105,.72),rgba(14,10,20,.96)_60%)] p-6 sm:p-7">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-extrabold tracking-[.16em] text-[#daa0ff]"><ShieldAlert size={17} /> CASTIGO DESBLOQUEADO</p>
            <h2 className="display-font max-w-3xl text-2xl font-bold tracking-tight">Los otros dos deben elegir una Nota de Instagram para {punishment.punished_player?.name ?? "el culpable"}.</h2>
            <div className="mt-4 flex flex-wrap gap-2">{involved.map((run) => <span key={run.id} className="glass-shell rounded-full px-3 py-1 text-xs text-[#dcc3ec]">TRY #{run.try_number} · {run.dead_player?.name}</span>)}</div>
          </div>
          <Link href="/punishments" className="btn btn-danger">Resolver castigo <ArrowRight size={17} /></Link>
        </div>
      </section>
    </Reveal>
  );
}

export function RecentRuns({ runs }: { runs: Run[] }) {
  return (
    <Reveal className="panel biome-section biome-end p-5 sm:p-6" delay={0.08}>
      <div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Última actividad</p><h2 className="display-font mt-2 text-2xl font-bold tracking-tight">Registro del Realm</h2></div><Link href="/history" className="flex items-center gap-2 text-sm font-bold text-[#c3a7ff]">Ver todo <ArrowRight size={16} /></Link></div>
      <div className="grid gap-3">
        {runs.slice(0, 5).map((run) => (
          <Lift key={run.id}>
            <Link href={`/history/${run.id}`} className="panel panel-interactive flex flex-wrap items-center gap-4 p-4">
              <span className="display-font grid size-12 place-items-center rounded-xl border border-white/10 bg-[#191321] font-bold text-[#cbb2ff]">#{run.try_number}</span>
              <div className="min-w-48 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="display-font">TRY #{run.try_number}</strong><StatusBadge status={run.status} /></div><p className="mt-1 text-sm text-[#8e8699]">{run.status === "failed" ? `${run.dead_player?.name ?? "Alguien"} murió por ${run.death_cause}` : run.status === "active" ? "La aventura continúa" : run.status === "completed" ? "El dragón cayó" : "Intento corregido o cancelado"}</p></div>
              <span className="flex items-center gap-2 text-sm text-[#8a8294]"><Clock3 size={15} />{run.status === "active" ? <ElapsedTime startedAt={run.started_at} /> : formatDuration(run.duration_seconds)}</span>
              <ArrowRight size={18} className="text-[#665d70]" />
            </Link>
          </Lift>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-[#6e6678]"><Gem size={14} /> Datos calculados directamente desde el historial de TRYs</div>
    </Reveal>
  );
}
