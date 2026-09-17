"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Home,
  LayoutGrid,
  Bell,
  Settings,
  Shield,
  FileText,
  BarChart3,
  DollarSign,
  Users,
  Workflow,
  Code2,
  Bug,
  Zap,
  Key,
  LifeBuoy,
  Bot,
  Cpu,
  GitBranch,
  ChevronLeft,
  ChevronRight,
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
  {
    label: "Dashboard Homepage",
    href: "/",
    icon: Home,
    roles: ["owner", "worker", "client"],
  },
  {
    label: "Prompt Marketplace Grid",
    href: "/marketplace",
    icon: LayoutGrid,
    roles: ["owner", "worker", "client"],
  },
  {
    label: "Notification Station",
    href: "/notifications",
    icon: Bell,
    roles: ["owner", "worker", "client"],
  },
  {
    label: "Profile & Settings",
    href: "/settings",
    icon: Settings,
    roles: ["owner", "worker", "client"],
  },
];

const OWNER_ITEMS: SidebarItem[] = [
  {
    label: "Remote Owner Control Panel",
    href: "/admin/control",
    icon: Shield,
    roles: ["owner"],
  },
  {
    label: "Live Audit Log Hub",
    href: "/admin/audit",
    icon: FileText,
    roles: ["owner"],
  },
  {
    label: "Marketplace Financial Engine",
    href: "/admin/finance",
    icon: DollarSign,
    roles: ["owner"],
  },
  {
    label: "Role Assignment Console",
    href: "/admin/roles",
    icon: Users,
    roles: ["owner"],
  },
];

const WORKER_ITEMS: SidebarItem[] = [
  {
    label: "Active Task Portal",
    href: "/worker/tasks",
    icon: Workflow,
    roles: ["worker"],
  },
  {
    label: "Developer Workspace",
    href: "/worker/workspace",
    icon: Code2,
    roles: ["worker"],
  },
  {
    label: "Prompt Benchmarking",
    href: "/worker/benchmark",
    icon: BarChart3,
    roles: ["worker"],
  },
  {
    label: "Support Ticket Desk",
    href: "/worker/tickets",
    icon: Bug,
    roles: ["worker"],
  },
];

const CLIENT_ITEMS: SidebarItem[] = [
  {
    label: "Instant Quote Engine",
    href: "/client/quote",
    icon: Zap,
    roles: ["client"],
  },
  {
    label: "Bought Prompt Vault",
    href: "/client/vault",
    icon: Key,
    roles: ["client"],
  },
  {
    label: "Customer Support Center",
    href: "/client/support",
    icon: LifeBuoy,
    roles: ["client"],
  },
  {
    label: "Seller Setup Hub",
    href: "/client/seller",
    icon: Users,
    roles: ["client"],
  },
];

const KILO_TOOLS: SidebarItem[] = [
  {
    label: "Kilo Code AI Prompt Agent",
    href: "/automation/kilo-agent",
    icon: Bot,
    roles: ["owner", "worker", "client"],
  },
  {
    label: "Battery Optimizer",
    href: "/automation/battery",
    icon: Cpu,
    roles: ["owner", "worker", "client"],
  },
  {
    label: "Code Converter",
    href: "/automation/converter",
    icon: GitBranch,
    roles: ["owner", "worker", "client"],
  },
];

function buildGroups(role: UserRole): SidebarGroup[] {
  const groups: SidebarGroup[] = [
    {
      title: "COMMON TOOLS",
      items: COMMON_ITEMS,
      roles: ["owner", "worker", "client"],
    },
  ];

  if (role === "owner") {
    groups.push(
      {
        title: "OWNER CONTROL",
        items: OWNER_ITEMS,
        roles: ["owner"],
      },
      {
        title: "KILO AUTOMATION TOOLS",
        items: KILO_TOOLS,
        roles: ["owner", "worker", "client"],
      },
    );
  } else if (role === "worker") {
    groups.push(
      {
        title: "WORKER PORTAL",
        items: WORKER_ITEMS,
        roles: ["worker"],
      },
      {
        title: "KILO AUTOMATION TOOLS",
        items: KILO_TOOLS,
        roles: ["owner", "worker", "client"],
      },
    );
  } else {
    groups.push(
      {
        title: "CLIENT PORTAL",
        items: CLIENT_ITEMS,
        roles: ["client"],
      },
      {
        title: "KILO AUTOMATION TOOLS",
        items: KILO_TOOLS,
        roles: ["owner", "worker", "client"],
      },
    );
  }

  return groups;
}

interface SidebarProps {
  activeRole?: UserRole;
}

export default function Sidebar({ activeRole = "client" }: SidebarProps) {
  const [role, setRole] = useState<UserRole>(activeRole);
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { resolvedTheme, setTheme } = useTheme();

  const groups = buildGroups(role);

  const roleColors: Record<UserRole, string> = {
    owner: "text-warning",
    worker: "text-info",
    client: "text-neon",
  };

  const roleBadgeColors: Record<UserRole, string> = {
    owner: "border-warning/30 bg-warning/5",
    worker: "border-info/30 bg-info/5",
    client: "border-neon/30 bg-neon/5",
  };

  return (
    <aside
      className={`relative flex h-screen flex-col overflow-hidden border-r border-border-soft bg-gradient-to-b from-slate-950 via-slate-900 to-black transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
      aria-label="Sidebar navigation"
    >
      {/* Dot-matrix pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, theme(colors.border) 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
        }}
        aria-hidden="true"
      />

      {/* Header: Logo + Collapse Toggle */}
      <div className="relative z-20 flex items-center justify-between px-3 py-4">
        {!collapsed && (
          <span className="text-xs font-bold tracking-[0.3em] text-text-dim">
            AUTOMATION // DASH
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded border border-border-soft bg-card/60 p-1.5 text-text-dim transition-all duration-200 hover:border-neon hover:text-neon hover:shadow-neon-glow"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Role Selector (Sandbox testing) */}
      <div className="relative z-20 border-t border-border-soft px-3 py-2">
        {!collapsed && (
          <span className="text-[9px] uppercase tracking-wider text-text-dim2">
            ROLE:
          </span>
        )}
        <div
          className={`mt-1 flex items-center gap-1 ${collapsed ? "flex-col" : "flex-row"}`}
        >
          {(["owner", "worker", "client"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`relative flex items-center justify-center rounded border text-[9px] font-bold uppercase tracking-wider transition-all duration-200 ${
                role === r
                  ? `${roleBadgeColors[r]} ${roleColors[r]} shadow-[0_0_8px]` 
                  : "border-border-soft text-text-dim hover:border-info hover:text-info"
              } ${collapsed ? "h-8 w-8" : "h-7 flex-1 px-2 py-1"}`}
              aria-pressed={role === r}
              title={collapsed ? r : undefined}
            >
              <span
                className={`absolute inset-0 rounded opacity-0 transition-opacity duration-200 ${
                  role === r ? "opacity-100" : "group-hover:opacity-50"
                }`}
                aria-hidden="true"
              />
              {!collapsed && <span>{r}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="relative z-20 border-t border-border-soft px-3 py-2">
        {!collapsed && (
          <span className="text-[9px] uppercase tracking-wider text-text-dim2">
            THEME:
          </span>
        )}
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "matrix" : "obsidian")}
          className={`mt-1 flex w-full items-center justify-center rounded border border-border-soft bg-card/40 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-text-dim transition-all duration-200 hover:border-info hover:text-info hover:shadow-info-glow ${
            collapsed ? "aspect-square" : ""
          }`}
          title="Toggle theme"
        >
          {!collapsed && <span>{resolvedTheme === "dark" ? "[ LIGHT_MODE ]" : "[ DARK_MODE ]"}</span>}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="relative z-20 flex-1 overflow-y-auto py-2">
        <div className="space-y-4 px-2">
          {groups.map((group) => (
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
                        className={`group relative mx-2 flex items-center gap-3 rounded-md border border-transparent px-3 py-2 text-[11px] font-mono font-medium uppercase tracking-wider text-text-dim transition-all duration-200 hover:translate-x-1 hover:border-info hover:text-info hover:shadow-info-glow ${
                          isHovered ? "bg-info/5 scale-[1.02]" : ""
                        }`}
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                            isHovered ? "text-info" : "text-text-dim"
                          }`}
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

      {/* Footer */}
      <div className="relative z-20 border-t border-border-soft px-3 py-3">
        {!collapsed && (
          <p className="text-[9px] uppercase tracking-wider text-text-dim2">
            v254.0.0-beta // ROBOTIC_MODE
          </p>
        )}
      </div>
    </aside>
  );
}
