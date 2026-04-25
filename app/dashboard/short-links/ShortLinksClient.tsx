"use client";

import { ExternalLink, Copy, Search, Link as LinkIcon, Calendar, ArrowRight } from "lucide-react";
import { Card as AntCard, Button as AntButton, Input as AntInput, Typography as AntTypography, message as AntMessage, Badge as AntBadge, Tooltip as AntTooltip, Empty } from "antd";
import { useState, useMemo } from "react";

const { Text, Title } = AntTypography;

type ShortLink = {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string;
  format: string;
  createdAt: string | Date;
};

export default function ShortLinksPage({ initialLinks }: { initialLinks: ShortLink[] }) {
  const [query, setQuery] = useState("");
  const [msgApi, contextHolder] = AntMessage.useMessage();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialLinks;
    return initialLinks.filter(l => 
      l.shortCode.toLowerCase().includes(q) || 
      l.originalUrl.toLowerCase().includes(q) ||
      l.title.toLowerCase().includes(q)
    );
  }, [initialLinks, query]);

  const copyToClipboard = async (text: string) => {
    const fullUrl = `${window.location.origin}/${text}`;
    await navigator.clipboard.writeText(fullUrl);
    msgApi.success(`Short link copied to clipboard`);
  };

  return (
    <div className="lv-page">
      {contextHolder}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-600 mb-0.5">Redirection Engine</div>
          <Title level={2} className="!m-0 !text-2xl !font-black tracking-tight">Short Links</Title>
          <Text className="text-[var(--sidebar-text)] text-[11px] mt-0.5 block">Manage and track your custom URL redirects.</Text>
        </div>
        
        <div className="relative group">
          <AntInput 
            placeholder="Filter links..." 
            prefix={<Search size={14} className="text-slate-400 mr-2" />}
            className="!rounded-xl !px-3 !py-1 !h-9 sm:w-52 !bg-[var(--card)] !border-[var(--border)] shadow-sm focus:!shadow-md transition-all text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            allowClear
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((link) => (
            <AntCard 
              key={link.id} 
              className="!rounded-3xl border-[var(--border)] hover:border-blue-500/50 transition-all overflow-hidden group"
              styles={{ body: { padding: 0 } }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <LinkIcon size={24} />
                  </div>
                  <AntTooltip title="Copy Short URL">
                    <AntButton 
                      type="text" 
                      icon={<Copy size={18} />} 
                      onClick={() => copyToClipboard(link.shortCode)}
                      className="!w-10 !h-10 !rounded-xl hover:!bg-blue-50 dark:hover:!bg-blue-900/30 !text-slate-400 hover:!text-blue-600 flex items-center justify-center"
                    />
                  </AntTooltip>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Slug</span>
                    <AntBadge status="processing" color="#2563eb" />
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight font-mono">
                    /{link.shortCode}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Text strong className="block text-sm mb-1 truncate" title={link.title}>{link.title}</Text>
                    <a 
                      href={link.originalUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-[var(--sidebar-text)] hover:text-blue-600 flex items-center gap-1.5 transition-colors line-clamp-1 break-all"
                    >
                      {link.originalUrl} <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--muted)] px-6 py-4 flex items-center justify-between border-t border-[var(--border)]">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  <Calendar size={12} />
                  {new Date(link.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <a 
                  href={link.originalUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1 group/btn"
                >
                  Visit Link <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-1" />
                </a>
              </div>
            </AntCard>
          ))}
        </div>
      ) : (
        <div className="py-32 bg-[var(--card)] rounded-[40px] border border-dashed border-[var(--border)] text-center">
          <Empty description={<Text className="text-slate-400 font-medium">No short links found</Text>} />
        </div>
      )}
    </div>
  );
}
