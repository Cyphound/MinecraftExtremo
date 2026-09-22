"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { BarChart3, DoorOpen, History, LayoutDashboard, ShieldAlert, Skull, UsersRound } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { RealmMark } from "@/components/brand";

const links = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/history", label: "Historial", icon: History },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/punishments", label: "Castigos", icon: ShieldAlert },
  { href: "/players", label: "Jugadores", icon: UsersRound },
];

export function Nav({ totalDeaths, currentTry }: { totalDeaths: number; currentTry: number | null }) {
  const pathname = usePathname();
  const [pending, setPending] = useState<{ path: string; from: string } | null>(null);
  const pendingPath = pending?.from === pathname ? pending.path : null;
  const isPending = pendingPath !== null;
  const activePath = pendingPath ?? pathname;

  return (
    <motion.aside
      className="realm-sidebar glass-shell"
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: .5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href="/" className="sidebar-brand" aria-label="Minecraft Extremo">
        <RealmMark compact />
        <span><strong>MINECRAFT</strong><b>EXTREMO</b></span>
      </Link>

      <div className="sidebar-realm">
        <span className="sidebar-realm__pulse" />
        <div><small>Realm activo</small><strong>TRY #{currentTry?.toString().padStart(2, "0") ?? "—"}</strong></div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegación principal" aria-busy={isPending}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? activePath === "/" : activePath.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              aria-current={active ? "page" : undefined}
              className={active ? "sidebar-link sidebar-link--active" : "sidebar-link"}
              onClick={() => { if (href !== pathname) setPending({ path: href, from: pathname }); }}
            >
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
              {active && <motion.i layoutId="nav-active" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            </Link>
          );
        })}
      </nav>

      {isPending && <div className="sidebar-loading" role="status"><span />Cargando sección…</div>}

      <div className="sidebar-footer">
        <div className="death-counter">
          <span><Skull size={20}/></span>
          <div><small>Muertes totales</small><strong>{totalDeaths.toString().padStart(2, "0")}</strong></div>
        </div>
        <form action={logoutAction}>
          <button className="sidebar-logout" title="Cerrar sesión"><DoorOpen size={17}/><span>Salir del Realm</span></button>
        </form>
      </div>
    </motion.aside>
  );
}
