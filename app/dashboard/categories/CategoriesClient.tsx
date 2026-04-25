"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Folder, Edit3, Trash2, Save, X, Smile } from "lucide-react";
import { Card, Typography, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import { deleteCategory, updateCategory } from "../actions";
import CategoryManager from "../components/CategoryManager";

const { Text, Title } = Typography;

type CategoryType = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  _count: { links: number; tags: number };
};

export default function CategoriesClient({ categories }: { categories: CategoryType[] }) {
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form] = Form.useForm();

  const openEdit = (category: CategoryType) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      icon: category.icon
    });
    setIsEditModalOpen(true);
  };

  const onUpdate = async (values: any) => {
    if (!editingCategory) return;
    
    startTransition(async () => {
      const res = await updateCategory(editingCategory.id, values);
      if (res.ok) {
        message.success("Category updated successfully");
        setIsEditModalOpen(false);
      } else {
        message.error(res.error || "Failed to update category");
      }
    });
  };

  const onDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.ok) {
        message.success("Category deleted successfully");
      } else {
        message.error(res.error || "Failed to delete category");
      }
    });
  };

  return (
    <div className="lv-categories-client">
      <Modal
        title="Edit Category"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        className="lv-modal"
      >
        <Form form={form} layout="vertical" onFinish={onUpdate} className="mt-4">
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input prefix={<Folder size={14} className="text-slate-400" />} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>Save Changes</Button>
          </div>
        </Form>
      </Modal>

      <div className="flex justify-between items-center mb-8 pb-6 border-b border-[var(--border)]">
        <div>
          <Title level={4} className="!mb-1">Vault Collections</Title>
          <Text type="secondary">Manage top-level organizational structures.</Text>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="lv-card-category group hover:border-[var(--primary)] transition-all !rounded-xl border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden" styles={{ body: { padding: "20px" } }}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[var(--primary)] text-white shadow-sm shrink-0">
                  <Folder size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate block text-lg font-bold text-[var(--foreground)]" title={category.name}>
                      {category.name}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="small" type="text" icon={<Edit3 size={14} className="text-slate-400" />} onClick={() => openEdit(category)} />
                      <Popconfirm
                        title="Delete category?"
                        onConfirm={() => onDelete(category.id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true, loading: isPending }}
                      >
                        <Button size="small" type="text" danger icon={<Trash2 size={14} />} />
                      </Popconfirm>
                    </div>
                  </div>
                  <Text type="secondary" className="text-sm mt-1 block h-10 line-clamp-2 leading-relaxed">
                    {category.description || "No description provided for this collection."}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[var(--border)] border-opacity-50">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[var(--foreground)]">{category._count.links}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resources</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[var(--foreground)]">{category._count.tags}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags</span>
                </div>
                <div className="ml-auto">
                  <Link href={`/dashboard/vault?category=${encodeURIComponent(category.name)}`} className="text-xs font-bold text-[var(--primary)] hover:underline">
                    Explore →
                  </Link>
                </div>
              </div>
          </Card>
        ))}
      </div>
      ) : (
        <div className="py-24 flex items-center justify-center bg-[var(--muted)] rounded-3xl border border-dashed border-[var(--border)]">
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/5 shadow-sm flex items-center justify-center mx-auto mb-4">
              <Smile size={32} className="text-slate-300" />
            </div>
            <div className="text-lg font-bold tracking-tight mb-1 text-[var(--foreground)]">No collections found in your library</div>
            <div className="text-sm text-[var(--sidebar-text)] mb-6">Create your first category to get started.</div>
            <CategoryManager />
          </div>
        </div>
      )}
    </div>
  );
}
