"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Logo from "@/app/components/Logo";
import {
  Home,
  LayoutGrid,
  Zap,
  Key,
  LifeBuoy,
  Workflow,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  FileText,
  DollarSign,
} from "lucide-react";

export type UserRole = "owner" | "worker" | "client";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
  roles: UserRole[];
}

const COMMON_ITEMS: SidebarItem[] = [
  { label: "Dashboard Homepage", href: "/", icon: Home, roles: ["owner", "worker", "client"] },
  { label: "Marketplace", href: "/#marketplace", icon: LayoutGrid, roles: ["owner", "worker", "client"] },
  { label: "Trade-In Terminal", href: "/trade-in", icon: Zap, roles: ["owner", "worker", "client"] },
];

const OWNER_ITEMS: SidebarItem[] = [
  { label: "Owner Dashboard", href: "/admin/dashboard", icon: Shield, roles: ["owner"] },
  { label: "Audit Log", href: "/admin/dashboard#audit", icon: FileText, roles: ["owner"] },
  { label: "Payout Approvals", href: "/admin/dashboard#payouts", icon: DollarSign, roles: ["owner"] },
];

const WORKER_ITEMS: SidebarItem[] = [
  { label: "Worker Dashboard", href: "/staff/dashboard", icon: Workflow, roles: ["worker"] },
  { label: "Diagnostic Grading", href: "/staff/dashboard#diagnostic", icon: BarChart3, roles: ["worker"] },
];

const CLIENT_ITEMS: SidebarItem[] = [
  { label: "Customer Vault", href: "/customer/dashboard", icon: Key, roles: ["client"] },
  { label: "Trade-In Offers", href: "/customer/dashboard#offers", icon: Zap, roles: ["client"] },
  { label: "Service Tickets", href: "/customer/dashboard#tickets", icon: LifeBuoy, roles: ["client"] },
];

const ALL_THEMES = ["obsidian", "matrix", "friendly", "cyberpunk", "synthwave", "retro"] as const;

function buildGroups(role: UserRole): SidebarGroup[] {
  const groups: SidebarGroup[] = [
    { title: "COMMON TOOLS", items: COMMON_ITEMS, roles: ["owner", "worker", "client"] },
  ];

  if (role === "owner") {
    groups.push({ title: "OWNER CONTROL", items: OWNER_ITEMS, roles: ["owner"] });
  } else if (role === "worker") {
    groups.push({ title: "WORKER PORTAL", items: WORKER_ITEMS, roles: ["worker"] });
  } else {
    groups.push({ title: "CLIENT PORTAL", items: CLIENT_ITEMS, roles: ["client"] });
  }

  return groups;
}

const ROLE_COLORS: Record<UserRole, string> = {
  owner: "text-warning",
  worker: "text-info",
  client: "text-neon",
};

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  owner: "border-warning/30 bg-warning/5",
  worker: "border-info/30 bg-info/5",
  client: "border-neon/30 bg-neon/5",
};

export default function Sidebar() {
  const { data: session } = useSession();
  const sessionRole = (session?.user?.role ?? "CUSTOMER").toLowerCase() as UserRole;

  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { resolvedTheme, setTheme } = useTheme();

  const groups = buildGroups(sessionRole);

  const visibleGroups = groups.filter((group) => group.roles.includes(sessionRole));

  return (
    <aside
      className={`relative flex h-screen flex-col overflow-hidden border-r border-border bg-gradient-to-b from-slate-950 via-slate-900 to-black transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
      aria-label="Sidebar navigation"
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, theme(colors.border) 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-20 flex items-center justify-between px-3 py-4">
        <Link href="/" aria-label="Home">
          <Logo size="sm" showPulse />
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded border border-border-soft bg-card/60 p-1.5 text-text-dim transition-all duration-200 hover:border-neon hover:text-neon hover:shadow-neon-glow"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative z-20 border-t border-border-soft px-3 py-2">
        {!collapsed && (
          <span className="text-[9px] uppercase tracking-wider text-text-dim2">
            ROLE:
          </span>
        )}
        <div className={`mt-1 flex items-center ${collapsed ? "flex-col" : "flex-row"}`}>
          <span
            className={`relative flex items-center justify-center rounded border text-[9px] font-bold uppercase tracking-wider transition-all duration-200 ${
              `${ROLE_BADGE_COLORS[sessionRole]} ${ROLE_COLORS[sessionRole]} shadow-[0_0_8px]`
            } ${collapsed ? "h-8 w-8" : "h-7 flex-1 px-2 py-1"}`}
            title={collapsed ? sessionRole : undefined}
          >
            {!collapsed && <span>{sessionRole}</span>}
          </span>
        </div>
      </div>

      <div className="relative z-20 border-t border-border-soft px-3 py-2">
        {!collapsed && (
          <span className="text-[9px] uppercase tracking-wider text-text-dim2">
            THEME:
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            const currentIndex = ALL_THEMES.indexOf(resolvedTheme as typeof ALL_THEMES[number]);
            const nextIndex = (currentIndex + 1) % ALL_THEMES.length;
            setTheme(ALL_THEMES[nextIndex]);
          }}
          className={`mt-1 flex w-full items-center justify-center rounded border border-border-soft bg-card/40 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-text-dim transition-all duration-200 hover:border-info hover:text-info hover:shadow-info-glow ${collapsed ? "aspect-square" : ""}`}
          title="Cycle themes"
        >
          {!collapsed && <span>[{resolvedTheme?.toUpperCase() ?? "OBSIDIAN"}]</span>}
        </button>
      </div>

      <nav className="relative z-20 flex-1 overflow-y-auto py-2">
        <div className="space-y-4 px-2">
          {visibleGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[9px] font-medium uppercase tracking-wider text-text-dim2">
                  {group.title}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isHovered = hoveredItem === item.label;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group relative mx-2 flex items-center gap-3 rounded-md border border-transparent px-3 py-2 text-[11px] font-mono font-medium uppercase tracking-wider text-text-dim transition-all duration-200 hover:translate-x-1 hover:border-info hover:text-info hover:shadow-info-glow ${isHovered ? "bg-info/5 scale-[1.02]" : ""}`}
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors duration-200 ${isHovered ? "text-info" : "text-text-dim"}`}
                        />
                        {!collapsed && <span>{item.label}</span>}

                        {collapsed && isHovered && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 rounded-md border border-info bg-slate-900/95 px-2.5 py-1.5 text-[9px] font-medium text-info opacity-0 shadow-info-glow backdrop-blur transition-opacity duration-200 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="relative z-20 border-t border-border-soft px-3 py-3">
        <Link
          href="/api/auth/signout"
          className={`group relative mx-2 flex items-center gap-3 rounded-md border border-transparent px-3 py-2 text-[11px] font-mono font-medium uppercase tracking-wider text-text-dim transition-all duration-200 hover:translate-x-1 hover:border-danger hover:text-danger hover:shadow-danger-glow ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-4 w-4 shrink-0 text-text-dim group-hover:text-danger" />
          {!collapsed && <span>LOGOUT</span>}
        </Link>
      </div>
    </aside>
  );
}
