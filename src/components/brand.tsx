import { Box, Gem } from "lucide-react";

export function RealmMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="realm-mark" aria-hidden="true">
      <span className="realm-mark__top" />
      <span className="realm-mark__face"><Gem size={compact ? 13 : 16} strokeWidth={2.5} /></span>
      <span className="realm-mark__edge" />
    </span>
  );
}

export function BiomeLegend() {
  return (
    <div className="biome-legend" aria-label="Biomas del recorrido">
      <span><i className="bg-[#5cc57a]" /> Overworld</span>
      <span><i className="bg-[#f05b5f]" /> Nether</span>
      <span><i className="bg-[#a982e8]" /> The End</span>
    </div>
  );
}

export function VoxelGlyph() {
  return <Box size={18} strokeWidth={2.2} aria-hidden="true" />;
}
