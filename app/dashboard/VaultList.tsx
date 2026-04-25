"use client";

import { useMemo, useState, useTransition, Suspense } from "react";
import type { ComponentType } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, List, Typography, message, Popconfirm, Tooltip, Select, Avatar } from "antd";
import { 
  Download, 
  Search, 
  Copy, 
  Trash2, 
  Youtube,
  Globe,
  FileText,
  Music,
  Hammer,
  GraduationCap,
  Clock,
  Edit3,
  Share2
} from "lucide-react";
import { deleteLink } from "./actions";
import LinkForm from "./LinkForm";

const { Text } = Typography;
const { Option } = Select;

type LinkItem = {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  shortCode: string;
  originalUrl: string;
  image: string | null;
  authorId: string | null;
  categoryId: string | null;
  author: { id: string; name: string; avatarUrl: string | null } | null;
  format: string;
  createdAt: string | Date;
  tags: { id: string; name: string; category?: { id: string; name: string } | null }[];
  category?: { name: string } | null;
};

type VaultListProps = {
  links: LinkItem[];
  existingTags: Array<{ id: string; name: string; categoryId: string | null; categoryName: string | null }>;
};

type FormatIcon = ComponentType<{ size?: number; className?: string }>;

const FORMAT_CONFIG: Record<string, { color: string; icon: FormatIcon; bg: string; border: string; text: string }> = {
  Web: { color: "#2563eb", icon: Globe, bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-500" },
  YouTube: { color: "#ef4444", icon: Youtube, bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-500" },
  Article: { color: "#10b981", icon: FileText, bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-500" },
  Song: { color: "#8b5cf6", icon: Music, bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-500" },
  Tool: { color: "#f59e0b", icon: Hammer, bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500" },
  Course: { color: "#2563eb", icon: GraduationCap, bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-500" },
};

function VaultListContent({ links, existingTags }: VaultListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [msgApi, contextHolder] = message.useMessage();
  
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterFormat, setFilterFormat] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  const filteredAndSorted = useMemo(() => {
    let result = [...links];
    const activeTagId = searchParams.get("tagId");
    const activeCategory = searchParams.get("category");
    const activeAuthor = searchParams.get("author");

    if (activeTagId) result = result.filter(link => link.tags.some(t => t.id === activeTagId));
    if (activeCategory) result = result.filter(link => link.category?.name === activeCategory);
    if (activeAuthor) result = result.filter(link => link.author?.name === activeAuthor);
    if (filterFormat) result = result.filter(link => link.format === filterFormat);

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((l) => 
        l.title.toLowerCase().includes(q) || (l.description || "").toLowerCase().includes(q) || l.tags.some(t => t.name.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      switch (sortBy) {
        case "oldest": return dateA - dateB;
        case "title-asc": return a.title.localeCompare(b.title);
        case "title-desc": return b.title.localeCompare(a.title);
        default: return dateB - dateA;
      }
    });
    return result;
  }, [links, query, searchParams, filterFormat, sortBy]);

  const handleCopy = async (code: string) => {
    const fullUrl = `${window.location.origin}/${code}`;
    await navigator.clipboard.writeText(fullUrl);
    msgApi.success(`Copied to clipboard`);
  };

  const handleShareClick = async (link: LinkItem) => {
    const shareUrl = `${window.location.origin}/${link.shortCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: link.title, text: link.description || "", url: shareUrl });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') handleCopy(link.shortCode);
      }
    } else {
      handleCopy(link.shortCode);
    }
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteLink(id);
      if (res.ok) { msgApi.success("Removed"); router.refresh(); }
      else { msgApi.error(res.error || "Failed"); }
    });
  };

  const formatDate = (value: string | Date) => {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  return (
    <section id="vault-list">
      {contextHolder}
      
      {editingLink && (
        <LinkForm 
          existingTags={existingTags} initialLink={editingLink} autoOpen={true}
          onClose={() => setEditingLink(null)} onSuccess={() => { setEditingLink(null); router.refresh(); }}
        />
      )}

      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
        <div className="flex-1 w-full lg:max-w-sm">
          <Input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources..."
            prefix={<Search size={14} className="text-[var(--sidebar-text)] mr-2" />}
            className="!rounded-lg !px-3 !py-1.5 !bg-[var(--input)] !border-[var(--border)] !h-9 text-sm"
            allowClear
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
          <Select variant="filled" value={sortBy} onChange={setSortBy} className="min-w-[130px] !h-9 !rounded-lg text-xs font-bold uppercase">
            <Option value="newest">Newest First</Option>
            <Option value="oldest">Oldest First</Option>
            <Option value="title-asc">A-Z</Option>
          </Select>

          <Select variant="filled" placeholder="Format" allowClear value={filterFormat} onChange={setFilterFormat} className="min-w-[100px] !h-9 !rounded-lg text-xs font-bold uppercase">
            {Object.keys(FORMAT_CONFIG).map(f => <Option key={f} value={f}>{f}</Option>)}
          </Select>

          <Button icon={<Download size={14} />} onClick={() => router.push("/api/export")} className="!rounded-lg font-black text-[10px] uppercase tracking-widest h-9 px-4 bg-blue-600 border-none text-white hover:opacity-90">
            Export
          </Button>
        </div>
      </div>

      {/* Full-Width STATIC Resource List */}
      <List
        className="lv-vault-list"
        dataSource={filteredAndSorted}
        grid={{ gutter: [0, 16], column: 1 }}
        pagination={{ pageSize: 10, className: "pt-8 pb-12", showTotal: (t) => <span className="text-[10px] font-black text-[var(--sidebar-text)] uppercase tracking-widest">{t} Resources</span> }}
        renderItem={(link) => {
          const config = FORMAT_CONFIG[link.format] || FORMAT_CONFIG.Web;
          const Icon = config.icon;
          
          return (
            <List.Item className="!mb-0 h-full p-0">
              <Card
                className="border-[var(--border)] bg-[var(--card)] !rounded-2xl overflow-hidden w-full h-full shadow-sm"
                styles={{ body: { padding: 0 } }}
              >
                <div className="flex flex-col md:flex-row h-full items-stretch">
                  {/* Left Column: Fixed 460px Visual Spine (STATIC) */}
                  <div className="relative w-full md:w-[460px] shrink-0 bg-[var(--muted)] border-r border-[var(--border)] min-h-[140px] md:min-h-0 overflow-hidden">
                    {link.image ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={link.image}
                          alt={link.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </>
                    ) : (
                      <div className={`absolute inset-0 flex items-center justify-center opacity-20 ${config.text}`}><Icon size={56} /></div>
                    )}
                    <div className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-sm pointer-events-none">
                      <Icon size={14} />
                    </div>
                  </div>
                  
                  {/* Right Column: High-Density Content area */}
                  <div className="p-4 md:p-5 flex-1 flex flex-col justify-between min-w-0 bg-[var(--card)]">
                    <div>
                      {/* Integrated Action Header - TOP ALIGNED */}
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="m-0 text-base font-bold text-[var(--foreground)] truncate leading-tight flex-1">
                          <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">{link.title}</a>
                        </h4>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* SHARE Icon-Only Action */}
                          <Tooltip title="Share">
                            <Button shape="circle" size="small" icon={<Share2 size={12} />} onClick={() => handleShareClick(link)} className="!bg-blue-500/10 !text-blue-500 border-none" />
                          </Tooltip>
                          
                          <div className="h-4 w-px bg-[var(--border)] mx-1" />
                          
                          <Tooltip title="Copy URL"><Button shape="circle" size="small" icon={<Copy size={12} />} onClick={() => handleCopy(link.shortCode)} className="!bg-[var(--muted)] !text-[var(--sidebar-text)] border-none" /></Tooltip>
                          <Tooltip title="Edit"><Button shape="circle" size="small" icon={<Edit3 size={12} />} onClick={() => setEditingLink(link)} className="!bg-[var(--muted)] !text-[var(--sidebar-text)] border-none" /></Tooltip>
                          <Popconfirm title="Delete?" onConfirm={() => handleDelete(link.id)}><Button shape="circle" size="small" danger icon={<Trash2 size={12} />} className="!bg-red-500/10 border-none" /></Popconfirm>
                        </div>
                      </div>

                      <Text className="text-[12px] leading-relaxed text-[var(--sidebar-text)] block mb-4 opacity-80 line-clamp-2">
                        {link.description || "Resource details preserved in your library."}
                      </Text>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {link.tags.slice(0, 6).map((tag) => (
                          <span key={tag.id} onClick={() => router.push(`/dashboard/vault?tagId=${encodeURIComponent(tag.id)}`)}
                            className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-[var(--muted)] border border-[var(--border)] text-[var(--sidebar-text)] hover:text-blue-600 cursor-pointer transition-all"
                          >#{tag.name}</span>
                        ))}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4">
                        {link.author && (
                          <Link href={`/dashboard/vault?author=${encodeURIComponent(link.author.name)}`} className="flex items-center gap-2 group/auth">
                            <Avatar src={link.author.avatarUrl || undefined} size={18} className="!bg-[var(--primary)] border border-white/10" />
                            <span className="text-[10px] font-bold text-[var(--foreground)] uppercase group-hover/auth:text-blue-600 transition-colors">{link.author.name}</span>
                          </Link>
                        )}
                        <div className="flex items-center gap-1.5 text-[var(--sidebar-text)] opacity-50">
                          <Clock size={12} /><span className="text-[10px] font-bold uppercase tracking-tighter">{formatDate(link.createdAt)}</span>
                        </div>
                      </div>

                      {/* Fixed Theme-Aware Format Badge */}
                      <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.text} border ${config.border} shadow-sm`}>
                        {link.format}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </List.Item>
          );
        }}
      />
    </section>
  );
}

export default function VaultList(props: VaultListProps) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-[140px] bg-[var(--card)] rounded-2xl border border-[var(--border)]"></div>)}
      </div>
    }>
      <VaultListContent {...props} />
    </Suspense>
  );
}
