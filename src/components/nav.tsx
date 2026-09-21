import Link from "next/link";
import { BarChart3, History, Skull, Swords, Trophy } from "lucide-react";
import { logoutAction } from "@/app/actions";

const links = [
  { href: "/", label: "Dashboard", icon: Swords }, { href: "/history", label: "Historial", icon: History },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 }, { href: "/punishments", label: "Castigos", icon: Skull },
];

export function Nav() {
  return <header className="sticky top-0 z-40 border-b border-[#202822] bg-[#080a09]/90 backdrop-blur-xl"><div className="container-app flex min-h-16 min-w-0 items-center justify-between gap-2 sm:gap-4">
    <Link href="/" className="flex shrink-0 items-center gap-2 font-black tracking-tight"><span className="grid size-9 place-items-center rounded-lg border border-[#425047] bg-[#171d19] text-[#6de28f]"><Trophy size={18}/></span><span className="hidden sm:inline">MINECRAFT <span className="text-[#ff5d62]">EXTREMO</span></span><span className="sm:hidden">EXTREMO</span></Link>
    <nav className="no-scrollbar flex min-w-0 flex-1 items-center justify-end gap-0 overflow-x-auto sm:gap-1" aria-label="Navegación principal">{links.map(({href,label,icon:Icon})=><Link key={href} href={href} title={label} aria-label={label} className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-2.5 text-sm font-bold text-[#9eaaa2] hover:bg-[#151a16] hover:text-white sm:px-3"><Icon size={17}/><span className="hidden lg:inline">{label}</span></Link>)}<form action={logoutAction} className="hidden sm:block"><button className="min-h-11 rounded-xl px-3 text-xs font-bold text-[#7e8a82] hover:text-white">Salir</button></form></nav>
  </div></header>;
}
