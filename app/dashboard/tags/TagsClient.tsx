"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { Hash, Edit3, Trash2, Save, X, Search, ChevronDown, ListFilter, TrendingUp, SortAsc, Clock, Folder, Music, Play, GraduationCap, Globe, Zap, Box, Bookmark, Heart, Star, Sparkles, MessageCircle, MoreVertical } from "lucide-react";
import { Card, Typography, Button, Modal, Form, Input, message, Popconfirm, Badge, Tag, Select, Dropdown, Menu, Tooltip } from "antd";
import { deleteTag, updateTag } from "../actions";
import TagManager from "../components/TagManager";

const { Text, Title } = Typography;

type TagType = {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  _count: { links: number };
};

const CATEGORY_ICON_MAP: Record<string, any> = {
  "Research": Sparkles,
  "Design": Play,
  "Development": Zap,
  "Entertainment": Music,
  "Personal": Heart,
  "Reference": Bookmark,
  "Education": GraduationCap,
  "Social": MessageCircle,
};

type CategoryType = {
  id: string;
  name: string;
};

export default function TagsClient({ tags, categories }: { tags: TagType[], categories: CategoryType[] }) {
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("count");
  const [form] = Form.useForm();

  const filteredAndSorted = useMemo(() => {
    return tags
      .filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || (t.description || "").toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "count") return b._count.links - a._count.links;
        return 0;
      });
  }, [tags, query, sortBy]);

  const openEdit = (tag: TagType) => {
    setEditingTag(tag);
    form.setFieldsValue({
      name: tag.name,
      description: tag.description,
      color: tag.color,
      categoryId: tag.categoryId
    });
    setIsEditModalOpen(true);
  };

  const onUpdate = async (values: any) => {
    if (!editingTag) return;
    
    startTransition(async () => {
      const res = await updateTag(editingTag.id, values);
      if (res.ok) {
        message.success("Tag updated successfully");
        setIsEditModalOpen(false);
      } else {
        message.error(res.error || "Failed to update tag");
      }
    });
  };

  const onDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteTag(id);
      if (res.ok) {
        message.success("Tag deleted successfully");
      } else {
        message.error(res.error || "Failed to delete tag");
      }
    });
  };

  return (
    <div className="lv-tags-client">
      <Modal
        title="Edit Tag"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        className="lv-modal"
      >
        <Form form={form} layout="vertical" onFinish={onUpdate} className="mt-4">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input prefix={<Hash size={14} className="text-slate-400" />} />
          </Form.Item>
          <Form.Item name="categoryId" label="Category">
            <Select
              placeholder="Select category"
              allowClear
              options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="color" label="Color (Hex)">
            <Input type="color" className="h-10 p-1" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>Save Changes</Button>
          </div>
        </Form>
      </Modal>

      {/* Hero Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3 w-full md:max-w-md">
          <Input 
            placeholder="Search tags..." 
            prefix={<Search size={16} className="text-slate-400" />} 
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="!rounded-xl !py-2.5 !bg-[var(--input)] !border-[var(--border)] shadow-sm"
            allowClear
          />
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Select 
            value={sortBy} 
            onChange={setSortBy}
            className="min-w-[140px] !h-11 font-semibold"
            suffixIcon={<ChevronDown size={14} />}
            variant="filled"
          >
            <Select.Option value="count">Most Popular</Select.Option>
            <Select.Option value="name">Alphabetical</Select.Option>
          </Select>
        </div>
      </div>

      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {filteredAndSorted.map((tag) => {
            const CategoryIcon = tag.category ? (CATEGORY_ICON_MAP[tag.category.name] || Folder) : Hash;
            
            return (
              <Card 
                key={tag.id} 
                className="lv-card-tag group hover:border-blue-500/50 !rounded-[24px] border border-[var(--border)] bg-[var(--card)] max-w-[320px] w-full mx-auto sm:mx-0 flex flex-col h-full" 
                styles={{ body: { padding: "24px", display: "flex", flexDirection: "column", height: "100%" } }}
              >
                {/* Header: Categorical Icon and Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div 
                    className={`p-3 rounded-2xl ${tag.color ? "" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"} group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm`} 
                    style={tag.color ? { backgroundColor: tag.color + "15", color: tag.color } : {}}
                  >
                    <CategoryIcon size={20} />
                  </div>
                  
                  <Badge 
                    count={tag._count.links} 
                    overflowCount={999} 
                    color={tag.color || "#3b82f6"} 
                    style={{ fontSize: "10px", fontWeight: "900", border: "none" }} 
                  />
                </div>

                {/* Tag Name */}
                <Link href={`/dashboard/vault?tagId=${encodeURIComponent(tag.id)}`} className="mb-2.5">
                  <span className="block text-xl font-black tracking-tight text-[var(--foreground)] group-hover:text-blue-600 transition-colors truncate" title={tag.name}>
                    #{tag.name}
                  </span>
                </Link>

                {/* Category Chip */}
                {tag.category && (
                  <div className="mb-4">
                    <span className="inline-flex items-center rounded-lg bg-[var(--muted)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500 border border-[var(--border)]">
                      {tag.category.name}
                    </span>
                  </div>
                )}

                {/* Description - Standardized Height */}
                <div className="flex-1 mb-6">
                  <Text className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed opacity-70 block line-clamp-3 min-h-[54px]">
                    {tag.description || <span className="italic opacity-40">No description provided for this resource group.</span>}
                  </Text>
                </div>

                {/* Footer: Stats and Actions */}
                <div className="pt-4 border-t border-[var(--border)] border-opacity-10 flex items-center justify-between">
                  <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {tag._count.links} {tag._count.links === 1 ? 'Resource' : 'Resources'}
                  </Text>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="small" 
                      type="text" 
                      icon={<Edit3 size={14} className="text-slate-400 hover:text-blue-600" />} 
                      onClick={() => openEdit(tag)} 
                      className="!flex items-center justify-center !w-7 !h-7 !rounded-lg hover:!bg-blue-500/5"
                    />
                    <Popconfirm
                      title="Delete tag?"
                      onConfirm={() => onDelete(tag.id)}
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true, loading: isPending }}
                    >
                      <Button 
                        size="small" 
                        type="text" 
                        danger 
                        icon={<Trash2 size={14} className="text-slate-400 hover:text-red-500" />} 
                        className="!flex items-center justify-center !w-7 !h-7 !rounded-lg hover:!bg-red-500/5"
                      />
                    </Popconfirm>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-24 flex flex-center justify-center bg-[var(--muted)] rounded-[32px] border border-dashed border-[var(--border)]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-white/5 shadow-sm flex items-center justify-center mx-auto mb-4">
              <Hash size={32} className="text-slate-300" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight mb-1">No tags found</div>
              <div className="text-sm font-medium opacity-60">Add tags to your vault to organize your library.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
