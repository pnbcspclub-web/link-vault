"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { 
  Globe, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  MoreVertical, 
  ExternalLink, 
  Search, 
  Filter, 
  ArrowUpDown,
  Users,
  Link as LinkIcon,
  Upload as UploadIcon
} from "lucide-react";
import { 
  Card, 
  Typography, 
  Avatar, 
  Button, 
  Dropdown, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Row, 
  Col, 
  Upload, 
  GetProp, 
  UploadProps,
  Segmented,
  type MenuProps
} from "antd";
import ImgCrop from "antd-img-crop";
import { updateAuthor, deleteAuthor } from "../actions";

const { Text, Title } = Typography;
const { TextArea } = Input;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

type Author = {
  id: string;
  name: string;
  type: string | null;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  _count: { links: number };
  tagCount: number;
};

type AuthorsClientProps = {
  authors: Author[];
};

export default function AuthorsClient({ authors }: AuthorsClientProps) {
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [sourceType, setSourceType] = useState<"upload" | "url">("upload");
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();
  const [msgApi, contextHolder] = message.useMessage();

  const avatarUrl = Form.useWatch("avatarUrl", form);

  // Controls state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("links-desc");
  const [filterType, setFilterType] = useState<string | null>(null);

  const authorTypes = useMemo(() => {
    const types = new Set<string>();
    authors.forEach(a => { if (a.type) types.add(a.type); });
    return Array.from(types).sort();
  }, [authors]);

  const filteredAndSortedAuthors = useMemo(() => {
    const result = authors.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (a.bio || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = !filterType || a.type === filterType;
      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "links-desc") return b._count.links - a._count.links;
      if (sortBy === "links-asc") return a._count.links - b._count.links;
      return 0;
    });

    return result;
  }, [authors, searchQuery, sortBy, filterType]);

  const openEdit = (author: Author) => {
    setEditingAuthor(author);
    const isBase64 = author.avatarUrl?.startsWith("data:");
    setSourceType(isBase64 ? "upload" : "url");
    form.setFieldsValue({
      name: author.name,
      type: author.type,
      avatarUrl: author.avatarUrl || undefined,
      bio: author.bio || undefined,
      website: author.website || undefined
    });
  };

  const closeEdit = () => {
    setEditingAuthor(null);
    form.resetFields();
  };

  const onUpdate = (values: any) => {
    if (!editingAuthor) return;
    startTransition(async () => {
      const res = await updateAuthor(editingAuthor.id, values);
      if (res.ok) {
        msgApi.success("Author updated successfully");
        closeEdit();
      } else {
        msgApi.error(res.error || "Failed to update author");
      }
    });
  };

  const onDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteAuthor(id);
      if (res.ok) {
        msgApi.success("Author removed from library");
      } else {
        msgApi.error(res.error || "Failed to delete author");
      }
    });
  };

  const getActionMenu = (author: Author): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit Details',
      icon: <Edit3 size={14} />,
      onClick: () => openEdit(author)
    },
    {
      key: 'vault',
      label: 'View in Vault',
      icon: <ExternalLink size={14} />,
      onClick: () => window.location.href = `/dashboard/vault?author=${encodeURIComponent(author.name)}`
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Remove Author',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Delete Author',
          content: `Are you sure you want to remove ${author.name}? This will not delete their links.`,
          okText: 'Delete',
          okType: 'danger',
          onOk: () => onDelete(author.id)
        });
      }
    },
  ];

  return (
    <div className="space-y-4 mt-2">
      {contextHolder}
      
      {/* Page Controls */}
      <div className="bg-[var(--card)] px-3 py-1.5 rounded-xl border border-[var(--border)] shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:max-w-md">
          <Input 
            placeholder="Search authors..." 
            prefix={<Search size={14} className="text-[var(--sidebar-text)]" />}
            className="!rounded-lg !h-8 !border-none !bg-transparent text-xs !shadow-none !outline-none focus:!shadow-none focus:!outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </div>
        
        <div className="flex items-center gap-1 w-full md:w-auto">
          <Select 
            variant="borderless"
            value={filterType} 
            onChange={setFilterType}
            placeholder="Filter Role"
            className="w-full md:w-32 !h-8 text-xs !bg-transparent !shadow-none !outline-none"
            allowClear
            suffixIcon={<Filter size={12} />}
          >
            {authorTypes.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
          </Select>
          
          <Select 
            variant="borderless"
            value={sortBy} 
            onChange={setSortBy}
            className="w-full md:w-36 !h-8 text-xs !bg-transparent !shadow-none !outline-none"
            suffixIcon={<ArrowUpDown size={12} />}
          >
            <Select.Option value="links-desc">Most Links</Select.Option>
            <Select.Option value="links-asc">Least Links</Select.Option>
            <Select.Option value="name-asc">Name (A-Z)</Select.Option>
            <Select.Option value="name-desc">Name (Z-A)</Select.Option>
          </Select>
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 pt-2 pb-4 border-b border-[var(--border)]">
            <Edit3 size={18} className="text-[var(--primary)]" />
            <Title level={4} className="!m-0 text-[var(--foreground)]">Edit Author Profile</Title>
          </div>
        }
        open={!!editingAuthor}
        onCancel={closeEdit}
        footer={null}
        centered
        destroyOnHidden
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={onUpdate} className="pt-6">
          <Form.Item
            name="name"
            label={<Text strong className="text-[var(--foreground)]">Display Name</Text>}
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Name" className="!rounded-lg" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label={<Text strong className="text-[var(--foreground)]">Role / Type</Text>}>
                <Select
                  placeholder="Select type"
                  options={[
                    { value: "Creator", label: "Creator" },
                    { value: "Writer", label: "Writer" },
                    { value: "Artist", label: "Artist" },
                    { value: "Developer", label: "Developer" },
                    { value: "Educator", label: "Educator" },
                    { value: "Company", label: "Company" }
                  ]}
                  className="!rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="website" label={<Text strong className="text-[var(--foreground)]">Website</Text>}>
                <Input placeholder="https://..." className="!rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={<Text strong className="text-[var(--foreground)]">Avatar Image</Text>} required>
            <div className="flex flex-col gap-4">
              <Segmented
                block
                value={sourceType}
                onChange={(val) => setSourceType(val as any)}
                options={[
                  { label: 'Direct Upload', value: 'upload', icon: <UploadIcon size={14} className="inline mr-1" /> },
                  { label: 'Image URL', value: 'url', icon: <LinkIcon size={14} className="inline mr-1" /> },
                ]}
                className="!rounded-lg p-1 bg-[var(--muted)]"
              />

              {sourceType === "upload" ? (
                <Form.Item name="avatarUrl" noStyle>
                  <div className="flex gap-2">
                    <ImgCrop aspect={1} rotationSlider>
                      <Upload
                        showUploadList={false}
                        beforeUpload={async (file) => {
                          const base64 = await getBase64(file as FileType);
                          form.setFieldsValue({ avatarUrl: base64 });
                          return false;
                        }}
                        className="flex-1"
                      >
                        <Button icon={<Edit3 size={14} />} className="w-full !rounded-lg bg-[var(--input)]">
                          Choose New Avatar
                        </Button>
                      </Upload>
                    </ImgCrop>
                    {avatarUrl && avatarUrl.startsWith("data:") && (
                      <Button 
                        icon={<X size={14} />} 
                        danger 
                        onClick={() => form.setFieldsValue({ avatarUrl: null })}
                        className="!rounded-lg"
                      />
                    )}
                  </div>
                </Form.Item>
              ) : (
                <Form.Item name="avatarUrl" noStyle>
                  <Input 
                    placeholder="https://example.com/avatar.png" 
                    className="!rounded-lg !h-10" 
                    prefix={<LinkIcon size={14} className="text-[var(--sidebar-text)]" />}
                  />
                </Form.Item>
              )}
            </div>
          </Form.Item>
          
          <Form.Item name="bio" label={<Text strong className="text-[var(--foreground)]">Short Biography</Text>}>
            <TextArea rows={3} placeholder="About..." className="!rounded-lg" />
          </Form.Item>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)] mt-6">
            <Button onClick={closeEdit} icon={<X size={16} />} className="flex items-center gap-2 !rounded-lg !h-10 px-6">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isPending} icon={<Save size={16} />} className="flex items-center gap-2 !rounded-lg !h-10 px-8 bg-[var(--primary)] text-white border-none">
              Update Author
            </Button>
          </div>
        </Form>
      </Modal>

      {filteredAndSortedAuthors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedAuthors.map((author) => (
            <Card 
              key={author.id} 
              className="lv-card-author group !rounded-xl border border-[var(--border)] overflow-hidden flex flex-col bg-[var(--card)]"
              styles={{ body: { padding: "0", flex: 1, display: "flex", flexDirection: "column" } }}
            >
              <div className="p-6 flex-1 flex flex-col items-center text-center">
                <div className="absolute top-4 right-4 z-10">
                   <Dropdown menu={{ items: getActionMenu(author) }} trigger={['click']}>
                      <Button 
                        type="text" 
                        shape="circle" 
                        icon={<MoreVertical size={16} className="text-[var(--sidebar-text)]" />} 
                        className="hover:bg-[var(--background)] flex items-center justify-center"
                      />
                   </Dropdown>
                </div>

                <div className="relative mb-5 mt-2">
                  <div className="p-1 rounded-full bg-[var(--background)] border border-[var(--border)] group-hover:border-[var(--primary)] transition-colors">
                    {author.avatarUrl ? (
                      <Avatar src={author.avatarUrl} size={84} className="border-2 border-[var(--card)] shadow-sm" />
                    ) : (
                      <Avatar size={84} className="border-2 border-[var(--card)] shadow-sm bg-[var(--primary)] text-white text-2xl font-bold">
                        {author.name[0]}
                      </Avatar>
                    )}
                  </div>
                  {author.website && (
                    <a 
                      href={author.website} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--card)] rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shadow-sm hover:bg-[var(--background)] transition-colors"
                    >
                      <Globe size={12} />
                    </a>
                  )}
                </div>
                
                <div className="mb-4">
                  <Title level={5} className="!mb-1 !font-bold text-[var(--foreground)] leading-tight">
                    {author.name}
                  </Title>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                    {author.type || "Creator"}
                  </span>
                </div>
                
                <Text type="secondary" className="text-xs line-clamp-2 min-h-[32px] mb-6 leading-relaxed text-[var(--sidebar-text)]">
                  {author.bio || "No biography available."}
                </Text>

                <div className="mt-auto w-full pt-5 border-t border-[var(--border)] opacity-80">
                  <div className="flex items-center justify-around">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-[var(--foreground)]">{author._count.links}</span>
                      <span className="text-[10px] font-bold text-[var(--sidebar-text)] uppercase tracking-widest">Links</span>
                    </div>
                    <div className="w-px h-6 bg-[var(--border)]"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-[var(--foreground)]">{author.tagCount}</span>
                      <span className="text-[10px] font-bold text-[var(--sidebar-text)] uppercase tracking-widest">Tags</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link 
                href={`/dashboard/vault?author=${encodeURIComponent(author.name)}`}
                className="block py-4 text-center bg-[var(--muted)] hover:bg-[var(--primary)] text-[var(--sidebar-text)] hover:text-white font-black text-[10px] uppercase tracking-widest transition-all border-t border-[var(--border)] group-hover:bg-[var(--primary)] group-hover:text-white"
              >
                View Resources
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-24 bg-[var(--card)] rounded-xl border border-dashed border-[var(--border)] text-center">
          <div className="flex flex-col items-center gap-3 text-[var(--sidebar-text)]">
            <Users size={48} strokeWidth={1} />
            <div className="text-lg font-medium text-[var(--foreground)] mt-2">No authors found</div>
            <Button type="link" onClick={() => { setSearchQuery(""); setFilterType(null); }} className="text-[var(--primary)]">
              Clear all filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

