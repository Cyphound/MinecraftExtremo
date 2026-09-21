import Link from "next/link";
import { BarChart3, DoorOpen, History, ShieldAlert, Swords } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { RealmMark } from "@/components/brand";

const links = [
  { href: "/", label: "Dashboard", icon: Swords },
  { href: "/history", label: "Historial", icon: History },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/punishments", label: "Castigos", icon: ShieldAlert },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 py-2 sm:py-3">
      <div className="container-app glass-shell flex min-h-15 min-w-0 items-center justify-between gap-2 rounded-[1.15rem] px-2.5 sm:gap-4 sm:rounded-[1.35rem] sm:px-4">
        <Link href="/" className="display-font flex shrink-0 items-center gap-2 font-bold tracking-[-.035em]">
          <RealmMark compact />
          <span className="hidden sm:inline">MINECRAFT <span className="text-[#ff6268]">EXTREMO</span></span>
          <span className="sm:hidden">EXTREMO</span>
        </Link>
        <nav className="no-scrollbar flex min-w-0 flex-1 items-center justify-end gap-0 overflow-x-auto sm:gap-1" aria-label="Navegación principal">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} title={label} aria-label={label} className="nav-pill flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold sm:px-3">
              <Icon size={17} strokeWidth={2.1} />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}
          <form action={logoutAction} className="hidden sm:block">
            <button className="nav-pill flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold" title="Cerrar sesión">
              <DoorOpen size={16} />
              <span className="hidden xl:inline">Salir</span>
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
