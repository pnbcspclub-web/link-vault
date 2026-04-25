"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { autoFetch, createLink, updateLink, getAuthors, getCategories } from "./actions";
import { 
  Button,
  Form,
  Input,
  Modal,
  Row,
  Col,
  Select,
  message,
  Typography,
  Avatar,
  Space as AntSpace,
  Image as AntImage,
  Upload,
  GetProp,
  UploadProps,
  Steps,
  Segmented
} from "antd";
import ImgCrop from "antd-img-crop";
import { 
  Copy, 
  Zap, 
  X, 
  Edit3, 
  Image as ImageIcon, 
  Upload as UploadIcon,
  ChevronRight,
  Plus,
  Link as LinkIcon
} from "lucide-react";
const { TextArea } = Input;
const { Title, Text } = Typography;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

function generateCode(length: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

type AuthorOption = {
  id: string;
  name: string;
  type?: string | null;
  avatarUrl?: string | null;
};

type CategoryOption = {
  id: string;
  name: string;
};

type LinkFormProps = {
  existingTags: Array<{ id: string; name: string; categoryId: string | null; categoryName: string | null }>;
  initialLink?: any;
  initialUrl?: string;
};

type LinkFormOptions = {
  autoOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
};

export default function LinkForm({
  existingTags,
  initialLink,
  initialUrl,
  autoOpen,
  onClose,
  onSuccess
}: LinkFormProps & LinkFormOptions) {
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();
  const [msgApi, contextHolder] = message.useMessage();
  const [tags, setTags] = useState<string[]>(initialLink?.tags.map((t: any) => t.name) || []);
  const [open, setOpen] = useState(Boolean(autoOpen));
  const [currentStep, setCurrentStep] = useState(0);
  const [imageSourceType, setImageSourceType] = useState<"upload" | "url">("upload");
  const [lastAutoFetchedUrl, setLastAutoFetchedUrl] = useState<string | null>(null);
  
  const selectedCategoryId = Form.useWatch("categoryId", form);
  const imageUrl = Form.useWatch("image", form);

  // Sync sourceType when image changes (e.g. from autofetch or initial)
  useEffect(() => {
    if (imageUrl) {
      if (imageUrl.startsWith('data:')) setImageSourceType("upload");
      else setImageSourceType("url");
    }
  }, [imageUrl]);
  
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const isEditing = !!initialLink;

  const loadData = useCallback(async () => {
    const [auths, cats] = await Promise.all([getAuthors(), getCategories()]);
    setAuthors(auths as AuthorOption[]);
    setCategories(cats as CategoryOption[]);
  }, []);

  useEffect(() => {
    if (open) {
      void loadData();
    }
  }, [open, loadData]);

  useEffect(() => {
    if (initialLink) {
      form.setFieldsValue({
        ...initialLink,
        authorId: initialLink.authorId || undefined,
        categoryId: initialLink.categoryId || undefined,
      });
      setTags(initialLink.tags.map((t: any) => t.name));
    }
  }, [initialLink, form]);

  useEffect(() => {
    if (!open || isEditing || !initialUrl) return;
    form.setFieldsValue({ originalUrl: initialUrl });
  }, [form, initialUrl, isEditing, open]);

  useEffect(() => {
    if (!open || isEditing || !initialUrl || lastAutoFetchedUrl === initialUrl) return;

    startTransition(async () => {
      try {
        const data = await autoFetch(initialUrl);
        if (!data) {
          msgApi.error("Could not fetch metadata for this URL");
          return;
        }

        form.setFieldsValue({
          originalUrl: initialUrl,
          title: data.title,
          description: data.description,
          image: data.image,
          contentArchive: data.contentArchive,
        });
        setLastAutoFetchedUrl(initialUrl);
        msgApi.success("Successfully fetched metadata");
      } catch {
        msgApi.error("Failed to fetch metadata");
      }
    });
  }, [form, initialUrl, isEditing, lastAutoFetchedUrl, msgApi, open, startTransition]);

  const availableTags = useMemo(() => {
    if (!selectedCategoryId) {
      return existingTags.filter((tag) => tag.categoryId === null);
    }
    return existingTags.filter((tag) => tag.categoryId === selectedCategoryId);
  }, [existingTags, selectedCategoryId]);

  const handleAutoFetch = () => {
    const url = form.getFieldValue("originalUrl");
    if (!url) {
      msgApi.warning("Please enter a URL first");
      return;
    }

    startTransition(async () => {
      try {
        const data = await autoFetch(url);
        if (!data) {
          msgApi.error("Could not fetch metadata for this URL");
          return;
        }
        form.setFieldsValue({
          title: data.title,
          description: data.description,
          image: data.image,
          contentArchive: data.contentArchive,
        });
        setLastAutoFetchedUrl(String(url));
        msgApi.success("Successfully fetched metadata");
      } catch {
        msgApi.error("Failed to fetch metadata");
      }
    });
  };

  const handleGenerateCode = () => {
    form.setFieldsValue({ shortCode: generateCode(5) });
  };

  const handleCopy = async () => {
    const code = form.getFieldValue("shortCode");
    if (!code) return;
    await navigator.clipboard.writeText(code);
    msgApi.success("Short code copied to clipboard");
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentStep(0);
    if (onClose) onClose();
  };

  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(["originalUrl", "title"]);
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = (values: Record<string, unknown>) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        formData.append(key, String(value));
      });
      formData.set("tags", tags.join(","));

      const result = isEditing 
        ? await updateLink(initialLink.id, formData)
        : await createLink(formData);

      if (!result?.ok) {
        msgApi.error(result?.error || `Failed to save link`);
        return;
      }
      
      msgApi.success(`Vault entry saved successfully`);
      if (!isEditing) {
        form.resetFields();
        setTags([]);
      }
      if (onSuccess) onSuccess();
      handleClose();
    });
  };

  const stepItems = [
    { title: 'Source' },
    { title: 'Organize' },
    { title: 'Finalize' },
  ];

  const content = (
    <div className="">
      {contextHolder}
      
      <div className="mb-4 border-b border-[var(--border)] pb-3">
        <Steps 
          current={currentStep} 
          items={stepItems} 
          size="small"
          className="lv-professional-steps !text-[10px]"
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ format: "Web" }}
        requiredMark={false}
        preserve={true}
      >
        <div className={currentStep !== 0 ? "hidden" : ""}>
          <Row gutter={48}>
            {/* Left Column: Form Inputs (60%) */}
            <Col span={14}>
              <div className="space-y-6">
                <Form.Item
                  name="originalUrl"
                  label={<Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Destination URL</Text>}
                  rules={[{ required: true, message: "URL is required" }]}
                >
                  <Input 
                    placeholder="https://example.com/resource" 
                    size="large"
                    disabled={isEditing}
                    className="!rounded-[4px] !h-11 !bg-[var(--input)] !border-[var(--border)] placeholder:text-slate-400"
                    suffix={
                      !isEditing && (
                        <Button 
                          type="primary" 
                          icon={<Zap size={14} />} 
                          onClick={handleAutoFetch}
                          loading={isPending}
                          className="!rounded-[4px] bg-blue-600 hover:!bg-blue-700 border-none font-bold text-[10px] h-8 flex items-center text-white"
                        >
                          AUTO-FETCH
                        </Button>
                      )
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="title"
                  label={<Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Entry Title</Text>}
                  rules={[{ required: true, message: "Title is required" }]}
                >
                  <Input placeholder="Descriptive title..." className="!rounded-[4px] !h-11 !bg-[var(--input)] !border-[var(--border)] placeholder:text-slate-400" size="large" />
                </Form.Item>

                <Form.Item 
                  name="description" 
                  label={<Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</Text>}
                >
                  <TextArea rows={5} placeholder="Brief overview of the content..." className="!rounded-[4px] !bg-[var(--input)] !border-[var(--border)] !p-3 placeholder:text-slate-400" />
                </Form.Item>
              </div>
            </Col>
            
            {/* Right Column: Image Uploader (40%) */}
            <Col span={10}>
              <div className="flex flex-col">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Image Setup</Text>
                
                <Segmented
                  block
                  value={imageSourceType}
                  onChange={(val) => setImageSourceType(val as "upload" | "url")}
                  options={[
                    { label: "Upload", value: "upload", icon: <UploadIcon size={14} className="inline mr-1" /> },
                    { label: "URL", value: "url", icon: <LinkIcon size={14} className="inline mr-1" /> },
                  ]}
                  className="!rounded-[4px] !p-1 !bg-[var(--muted)] mb-4"
                />

                <Form.Item name="image" hidden>
                  <Input type="hidden" />
                </Form.Item>

                <div className="relative rounded-[4px] overflow-hidden border border-dashed border-slate-300 dark:border-slate-700 bg-[var(--uploader-bg)] flex flex-col items-center justify-center group h-[200px] mb-4">
                  {imageUrl ? (
                    <>
                      <AntImage 
                        src={imageUrl} 
                        alt="Preview" 
                        className="object-cover w-full h-full"
                        preview={false}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                         {imageSourceType === "upload" && (
                           <ImgCrop aspect={16 / 9} rotationSlider>
                              <Upload
                                showUploadList={false}
                                beforeUpload={async (file) => {
                                  const base64 = await getBase64(file as FileType);
                                  form.setFieldsValue({ image: base64 });
                                  return false;
                                }}
                              >
                                <Button size="small" className="!rounded-[4px] bg-white text-slate-900 border-none font-bold px-4">CHANGE</Button>
                              </Upload>
                           </ImgCrop>
                         )}
                         <Button 
                           size="small"
                           icon={<X size={14} />} 
                           danger 
                           className="!rounded-[4px] font-bold"
                           onClick={() => form.setFieldsValue({ image: null })}
                         />
                      </div>
                    </>
                  ) : (
                    imageSourceType === "upload" ? (
                      <ImgCrop aspect={16 / 9} rotationSlider>
                        <Upload
                          showUploadList={false}
                          beforeUpload={async (file) => {
                            const base64 = await getBase64(file as FileType);
                            form.setFieldsValue({ image: base64 });
                            return false;
                          }}
                        >
                          <div className="cursor-pointer flex flex-col items-center text-slate-500 hover:text-blue-500 transition-colors">
                            <ImageIcon size={32} strokeWidth={1.5} />
                            <span className="text-[10px] font-bold uppercase mt-3 tracking-widest">Select Image</span>
                          </div>
                        </Upload>
                      </ImgCrop>
                    ) : (
                      <div className="flex flex-col items-center text-slate-500">
                         <LinkIcon size={32} strokeWidth={1.5} />
                         <span className="text-[10px] font-bold uppercase mt-3 tracking-widest text-center px-4">Paste a URL below to preview</span>
                      </div>
                    )
                  )}
                </div>

                {imageSourceType === "url" && (
                  <div className="">
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Image Address</Text>
                    <Input 
                      placeholder="https://example.com/image.png" 
                      className="!rounded-[4px] !h-10 !bg-[var(--input)] !border-[var(--border)] text-[11px] placeholder:text-slate-400"
                      value={imageUrl?.startsWith('data:') ? '' : imageUrl}
                      onChange={(e) => form.setFieldsValue({ image: e.target.value })}
                      suffix={imageUrl && !imageUrl.startsWith('data:') && (
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<X size={12} />} 
                          className="hover:!text-red-500"
                          onClick={() => form.setFieldsValue({ image: null })}
                        />
                      )}
                    />
                  </div>
                )}
                
                <div>
                  <Text className="text-[10px] text-slate-500 italic block mt-2">Recommended: 16:9 aspect ratio.</Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div className={currentStep !== 1 ? "hidden" : ""}>
          <Row gutter={[32, 24]}>
            <Col span={12}>
              <Form.Item 
                name="authorId" 
                label={<Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Author</Text>}
              >
                <Select 
                  placeholder="Select author" 
                  className="!rounded-[4px] !h-11"
                  size="large"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={authors.map(a => ({
                    value: a.id,
                    label: a.name,
                    emoji: a.avatarUrl ? <Avatar src={a.avatarUrl} size="small" /> : <Avatar size="small">{a.name[0]}</Avatar>
                  }))}
                  optionRender={(option) => (
                    <AntSpace>
                      {option.data.emoji}
                      {option.data.label}
                    </AntSpace>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="categoryId" 
                label={<Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</Text>}
              >
                <Select 
                  placeholder="Select category" 
                  className="!rounded-[4px] !h-11"
                  size="large"
                  allowClear
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                />
              </Form.Item>
            </Col>
            
            <Col span={16}>
              <Form.Item label={<Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tags</Text>}>
                <Select
                  mode="tags"
                  placeholder="Add tags..."
                  size="large"
                  value={tags}
                  onChange={(value) => setTags(value)}
                  options={availableTags.map((tag) => ({ value: tag.name, label: tag.name }))}
                  className="w-full !rounded-[4px]"
                />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item name="format" label={<Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Format</Text>}>
                <Select
                  className="w-full !rounded-[4px] !h-11"
                  size="large"
                  options={[
                    { value: "Web", label: "🌐 Web" },
                    { value: "YouTube", label: "📺 YouTube" },
                    { value: "Article", label: "📄 Article" },
                    { value: "Song", label: "🎵 Song" },
                    { value: "Tool", label: "🛠️ Tool" },
                    { value: "Course", label: "🎓 Course" }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className={currentStep !== 2 ? "hidden" : "space-y-8"}>
          <Form.Item 
            name="notes" 
            label={<Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Internal Notes</Text>}
          >
            <TextArea rows={5} placeholder="Takeaways, quotes, or key points..." className="!rounded-[4px] !bg-[var(--input)] !border-[var(--border)] !p-4" />
          </Form.Item>

          <div className="bg-[var(--muted)] p-6 rounded-[4px] border border-[var(--border)]">
            <Row gutter={24} align="bottom">
              <Col span={14}>
                <Form.Item
                  name="shortCode"
                  label={<Text className="text-[11px] font-bold uppercase tracking-wider text-[var(--sidebar-text)]">Short Link Slug</Text>}
                  rules={[{ required: true, message: "Required" }]}
                  className="!mb-0"
                >
                  <Input 
                    prefix={<Text className="text-blue-500 font-bold mr-1">lv.link/</Text>} 
                    className="!rounded-[4px] font-mono !h-11 !bg-[var(--input)] !border-[var(--border)] text-[var(--foreground)]"
                    disabled={isEditing}
                  />
                </Form.Item>
              </Col>
              <Col span={10}>
                {!isEditing && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleGenerateCode} 
                      className="flex-1 !rounded-[4px] !h-11 font-bold text-[10px] uppercase tracking-wider !bg-[var(--card)] !border-[var(--border)] !text-[var(--foreground)] hover:!text-blue-500"
                    >
                      Generate
                    </Button>
                    <Button 
                      icon={<Copy size={14} />} 
                      onClick={handleCopy}
                      className="flex-1 !rounded-[4px] !h-11 font-bold text-[10px] uppercase tracking-wider !bg-[var(--card)] !border-[var(--border)] !text-[var(--foreground)] hover:!text-blue-500"
                    >
                      Copy
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center mt-1 pt-3 border-t border-[var(--border)]">
          <Button 
            onClick={handleClose} 
            type="link"
            className="!h-8 px-0 font-bold text-[var(--sidebar-text)] hover:!text-red-500 tracking-wider text-[8px] uppercase"
          >
            CANCEL ACTION
          </Button>
          
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button 
                onClick={prev} 
                className="!rounded-[4px] !h-8 px-3 font-bold text-[8px] uppercase tracking-widest !bg-[var(--card)] !border-[var(--border)] !text-[var(--foreground)] hover:!text-blue-500"
              >
                Previous
              </Button>
            )}
            
            {currentStep < stepItems.length - 1 ? (
              <Button 
                type="primary" 
                onClick={next}
                className="!rounded-[4px] !h-8 px-4 bg-blue-600 border-none font-bold text-[8px] uppercase tracking-widest"
              >
                Next Step <ChevronRight size={14} className="ml-1 inline" />
              </Button>
            ) : (
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isPending} 
                className="!rounded-[4px] !h-8 px-4 bg-blue-600 border-none font-bold text-[8px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
              >
                {isEditing ? 'UPDATE ENTRY' : 'FINISH & SAVE'}
              </Button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={1000}
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-blue-600 flex items-center justify-center text-white">
            {isEditing ? <Edit3 size={18} /> : <Plus size={18} />}
          </div>
          <div>
            <Title level={4} className="!m-0 !font-bold tracking-tight text-[var(--foreground)]">{isEditing ? 'Edit Vault Resource' : 'New Vault Resource'}</Title>
          </div>
        </div>
      }
      destroyOnHidden
      className="lv-modal-wizard"
      centered
      styles={{
        mask: { backdropFilter: 'blur(8px)', background: 'rgba(2, 6, 23, 0.8)' },
        body: { padding: '16px 32px 8px 32px', borderRadius: '12px', background: 'var(--card)' },
        header: { marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }
      }}
    >
      {content}
    </Modal>
  );
}
