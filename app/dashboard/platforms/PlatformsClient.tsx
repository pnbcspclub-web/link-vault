"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Globe, 
  Youtube, 
  Twitter, 
  Music, 
  Instagram, 
  Linkedin, 
  Github, 
  Podcast, 
  BookOpen, 
  FileText, 
  Hammer, 
  GraduationCap, 
  Mail, 
  Users, 
  Search, 
  ExternalLink,
  MessageCircle,
  HelpCircle
} from "lucide-react";
import { Card, Input, Typography, Tag } from "antd";

const { Text, Title } = Typography;

interface PlatformItem {
  name: string;
  count: number;
}

const PLATFORM_CONFIG: Record<string, { color: string; icon: any; bg: string; text: string }> = {
  Web: { color: "#2563eb", icon: Globe, bg: "bg-blue-500/10", text: "text-blue-500" },
  YouTube: { color: "#ef4444", icon: Youtube, bg: "bg-red-500/10", text: "text-red-500" },
  Twitter: { color: "#1da1f2", icon: Twitter, bg: "bg-sky-500/10", text: "text-sky-500" },
  TikTok: { color: "#ff0050", icon: Music, bg: "bg-rose-500/10", text: "text-rose-500" },
  Instagram: { color: "#e1306c", icon: Instagram, bg: "bg-pink-500/10", text: "text-pink-500" },
  LinkedIn: { color: "#0077b5", icon: Linkedin, bg: "bg-blue-600/10", text: "text-blue-600" },
  GitHub: { color: "#24292e", icon: Github, bg: "bg-neutral-500/10", text: "text-neutral-500 dark:text-neutral-300" },
  Podcast: { color: "#8b5cf6", icon: Podcast, bg: "bg-purple-500/10", text: "text-purple-500" },
  Book: { color: "#059669", icon: BookOpen, bg: "bg-emerald-500/10", text: "text-emerald-500" },
  Article: { color: "#10b981", icon: FileText, bg: "bg-emerald-500/10", text: "text-emerald-500" },
  Song: { color: "#ec4899", icon: Music, bg: "bg-pink-500/10", text: "text-pink-500" },
  Tool: { color: "#f59e0b", icon: Hammer, bg: "bg-amber-500/10", text: "text-amber-500" },
  Course: { color: "#3b82f6", icon: GraduationCap, bg: "bg-blue-500/10", text: "text-blue-500" },
  Newsletter: { color: "#06b6d4", icon: Mail, bg: "bg-cyan-500/10", text: "text-cyan-500" },
  Community: { color: "#ec4899", icon: Users, bg: "bg-pink-500/10", text: "text-pink-500" },
};

function getPlatformStyle(name: string) {
  const key = Object.keys(PLATFORM_CONFIG).find(k => k.toLowerCase() === name.toLowerCase());
  if (key) {
    return PLATFORM_CONFIG[key];
  }
  return { color: "#64748b", icon: Globe, bg: "bg-slate-500/10", text: "text-slate-500" };
}

export default function PlatformsClient({ platforms }: { platforms: PlatformItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlatforms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return platforms;
    return platforms.filter(p => p.name.toLowerCase().includes(q));
  }, [platforms, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Top filter section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <Title level={4} className="!mb-1">Platform Collections</Title>
          <Text type="secondary">Explore saved resources categorized by media format and host platforms.</Text>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search platforms..."
            prefix={<Search size={16} className="text-slate-400 mr-1.5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!rounded-xl !h-10 !bg-[var(--input)] !border-[var(--border)]"
            allowClear
          />
        </div>
      </div>

      {filteredPlatforms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPlatforms.map((platform) => {
            const style = getPlatformStyle(platform.name);
            const Icon = style.icon;

            return (
              <Link 
                key={platform.name}
                href={`/dashboard/vault?format=${encodeURIComponent(platform.name)}`}
                className="group block"
              >
                <Card 
                  className="hover:border-[var(--primary)] transition-all !rounded-2xl border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden" 
                  styles={{ body: { padding: "20px" } }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${style.bg} ${style.text} transition-transform group-hover:scale-105 shrink-0`}>
                      <Icon size={22} style={{ color: style.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="truncate block text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {platform.name}
                        </span>
                        <ExternalLink size={14} className="text-[var(--sidebar-text)] opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0" />
                      </div>
                      <div className="mt-1">
                        <Tag className="rounded-full font-bold text-[10px] px-2 py-0 border-none bg-[var(--muted)] text-[var(--sidebar-text)]">
                          {platform.count} {platform.count === 1 ? "Link" : "Links"}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-24 flex items-center justify-center bg-[var(--muted)] rounded-3xl border border-dashed border-[var(--border)] text-center">
          <div className="max-w-xs mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[var(--card)] shadow-sm flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={32} className="text-slate-300" />
            </div>
            <div className="text-lg font-bold tracking-tight mb-1 text-[var(--foreground)]">No matching platforms</div>
            <div className="text-sm text-[var(--sidebar-text)]">Try searching for another keyword or check spelling.</div>
          </div>
        </div>
      )}
    </div>
  );
}
