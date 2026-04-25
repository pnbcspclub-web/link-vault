import { prisma } from "@/lib/db";
import { 
  Download, 
  Settings as SettingsIcon, 
  ExternalLink, 
  Link as LinkIcon,
  TrendingUp,
  ArrowRight,
  Hash,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { Button, Tooltip } from "antd";
import PageHeader from "./components/PageHeader";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalLinks, totalTags, totalCategories, recentLinks, topCategory] = await Promise.all([
    prisma.link.count(),
    prisma.tag.count(),
    prisma.category.count(),
    prisma.link.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { tags: true, category: true }
    }),
    prisma.category.findFirst({
      where: {
        links: {
          some: {}
        }
      },
      include: {
        _count: {
          select: { links: true }
        }
      },
      orderBy: {
        links: {
          _count: 'desc'
        }
      }
    })
  ]);

  return (
    <div className="lv-page">
      <PageHeader
        eyebrow="Dashboard"
        title="Overview"
        description="A clean snapshot of your vault activity and structure."
      />

      {/* Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Links */}
        <div className="relative overflow-hidden bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm h-[132px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-[var(--sidebar-text)]">Total Links</div>
              <div className="text-3xl font-semibold text-[var(--foreground)] tracking-tight mt-2">{totalLinks}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <LinkIcon size={18} />
            </div>
          </div>
          <div className="mt-4 text-[11px] text-[var(--sidebar-text)]">
            All stored resources
          </div>
        </div>
        
        {/* Active Tags */}
        <div className="relative overflow-hidden bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm h-[132px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-[var(--sidebar-text)]">Active Tags</div>
              <div className="text-3xl font-semibold text-[var(--foreground)] tracking-tight mt-2">{totalTags}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Hash size={18} />
            </div>
          </div>
          <div className="mt-4 text-[11px] text-[var(--sidebar-text)]">
            Labels applied to links
          </div>
        </div>

        {/* Categories */}
        <div className="relative overflow-hidden bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm h-[132px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-[var(--sidebar-text)]">Categories</div>
              <div className="text-3xl font-semibold text-[var(--foreground)] tracking-tight mt-2">{totalCategories}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-900/5 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              <LayoutGrid size={18} />
            </div>
          </div>
          <div className="mt-4 text-[11px] text-[var(--sidebar-text)]">
            Organized collections
          </div>
        </div>

        {/* Top Category */}
        <div className="relative overflow-hidden bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm h-[132px]">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="text-xs font-medium text-[var(--sidebar-text)]">Top Category</div>
              <div className="text-lg font-semibold text-[var(--foreground)] truncate tracking-tight mt-2">
                {topCategory?.name || "None"}
              </div>
              <div className="text-[11px] text-[var(--sidebar-text)] mt-1">
                {topCategory?._count.links || 0} {topCategory?._count.links === 1 ? "Resource" : "Resources"}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Entries Feed */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)]">
              Recent Entries
            </h2>
            <Link href="/dashboard/vault" className="group text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
              View Archive <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentLinks.map((link) => (
              <div key={link.id} className="group bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] hover:border-blue-600/30 transition-all duration-300 flex items-center justify-between gap-6">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[var(--muted)] flex items-center justify-center shrink-0 border border-[var(--border)] text-slate-400 group-hover:text-blue-600 transition-all">
                    <LinkIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="truncate block font-semibold text-[var(--foreground)] text-base tracking-tight mb-1.5">
                      {link.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[var(--sidebar-text)]">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)]">
                        {new Date(link.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                      {link.category && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/10">
                          {link.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Tooltip title="Open">
                  <Button 
                    type="text" 
                    shape="circle"
                    size="large"
                    icon={<ExternalLink size={18} className="text-slate-400 group-hover:text-blue-600" />}
                    href={link.originalUrl}
                    target="_blank"
                    className="hover:!bg-blue-500/10"
                  />
                </Tooltip>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] mb-4">
              Management
            </h2>
            <div className="flex flex-col gap-3">
              <Link 
                href="/api/export" 
                className="flex items-center justify-between w-full h-12 px-4 rounded-xl border border-[var(--border)] text-[var(--foreground)] hover:border-blue-600/40 hover:bg-blue-600/[0.03] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
                    <Download size={16} />
                  </div>
                  <span className="text-sm font-medium">Export Vault</span>
                </div>
                <ArrowRight size={14} className="text-[var(--sidebar-text)]" />
              </Link>
              <Link 
                href="/dashboard/settings" 
                className="flex items-center justify-between w-full h-12 px-4 rounded-xl border border-[var(--border)] text-[var(--foreground)] hover:border-blue-600/40 hover:bg-blue-600/[0.03] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900/5 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                    <SettingsIcon size={16} />
                  </div>
                  <span className="text-sm font-medium">Preferences</span>
                </div>
                <ArrowRight size={14} className="text-[var(--sidebar-text)]" />
              </Link>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-[linear-gradient(120deg,rgba(37,99,235,0.06),rgba(2,6,23,0.02))] border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-300">
              <TrendingUp size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">Note</span>
            </div>
            <p className="text-sm text-[var(--sidebar-text)] leading-relaxed">
              Keep titles consistent and categories focused to improve retrieval speed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
