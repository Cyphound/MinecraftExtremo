import { Skull } from "lucide-react";
import { AutoRefresh } from "@/components/auto-refresh";
import { BiomeLegend, RealmMark } from "@/components/brand";
import { ElapsedTime } from "@/components/elapsed-time";
import { PageReveal } from "@/components/motion";
import { getAppData } from "@/lib/data";
import { progressName } from "@/lib/game-config";
import { playerStats } from "@/lib/stats";

export const metadata = { title: "Overlay" };
export const dynamic = "force-dynamic";

export default async function OverlayPage() {
  const data = await getAppData();
  const current = data.runs.find((run) => run.status === "active") ?? data.runs[0];
  const best = Math.max(0, ...data.runs.map((run) => run.progress_stage));

  return (
    <main className="voxel-grid min-h-screen p-5 sm:p-10">
      <AutoRefresh />
      <PageReveal>
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl content-between gap-10">
          <header className="glass-shell flex flex-wrap items-end justify-between gap-6 rounded-[1.6rem] p-6 sm:p-8">
            <div>
              <div className="mb-4 flex items-center gap-3"><RealmMark/><div><p className="eyebrow">Hardcore Realm</p><BiomeLegend/></div></div>
              <h1 className="mc-title pixel-shadow text-4xl leading-[.9] sm:text-6xl">MINECRAFT <strong>EXTREMO</strong></h1>
            </div>
            <div className="text-right"><p className="eyebrow">TRY actual</p><p className="display-font mt-2 text-5xl font-bold text-[#77ed92]">#{current?.try_number ?? "—"}</p></div>
          </header>

          <section className="grid gap-5 md:grid-cols-3">
            {data.players.map((player, index) => {
              const stats = playerStats(player, data.runs);
              return (
                <article key={player.id} className="panel overflow-hidden p-6 text-center">
                  <span className={`absolute inset-x-0 top-0 h-[3px] ${index === 0 ? "bg-[#6de28f]" : index === 1 ? "bg-[#f16a64]" : "bg-[#a982e8]"}`} />
                  <p className="display-font text-2xl font-bold">{player.name}</p>
                  <p className="display-font mt-3 flex items-center justify-center gap-2 text-4xl font-bold text-[#ff666b]"><Skull size={28}/>{stats.deaths}</p>
                  <p className="mt-2 text-sm text-[#77847c]">racha {stats.currentStreak} TRYs</p>
                </article>
              );
            })}
          </section>

          <footer className="grid gap-5 sm:grid-cols-2">
            <div className="panel p-6"><p className="eyebrow">Mejor TRY</p><p className="display-font mt-2 text-3xl font-bold text-[#f6c85f]">{progressName(best)}</p></div>
            <div className="panel p-6"><p className="eyebrow">Tiempo actual</p><p className="display-font mt-2 font-mono text-4xl font-bold">{current?.status === "active" ? <ElapsedTime startedAt={current.started_at}/> : "00:00:00"}</p></div>
          </footer>
        </div>
      </PageReveal>
    </main>
  );
}
