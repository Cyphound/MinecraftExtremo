import { Pickaxe } from "lucide-react";

export function RealmMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "realm-mark realm-mark--compact" : "realm-mark"} aria-hidden="true">
      <Pickaxe size={compact ? 17 : 21} strokeWidth={2.2} />
    </span>
  );
}

export function BiomeLegend() {
  return (
    <div className="biome-legend" aria-label="Biomas del recorrido">
      <span><i className="biome-dot biome-dot--overworld" /> Overworld</span>
      <span><i className="biome-dot biome-dot--nether" /> Nether</span>
      <span><i className="biome-dot biome-dot--end" /> The End</span>
    </div>
  );
}
