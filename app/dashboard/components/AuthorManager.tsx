"use client";

import { useState, useTransition } from "react";
import { Button, Form, Input, Modal, message, Typography, Select, Row, Col, Upload, GetProp, UploadProps, Segmented } from "antd";
import ImgCrop from "antd-img-crop";
import { Plus, UserPlus, Save, X, Upload as UploadIcon, Link as LinkIcon } from "lucide-react";
import { createAuthor } from "../actions";
import { useRouter } from "next/navigation";

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

type AuthorFormValues = {
  name: string;
  type?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
};

export default function AuthorManager() {
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const [sourceType, setSourceType] = useState<"upload" | "url">("upload");
  const avatarUrl = Form.useWatch("avatarUrl", form);

  const onFinish = (values: AuthorFormValues) => {
    startTransition(async () => {
      const res = await createAuthor(values);
      if (res.ok) {
        msgApi.success("Author created successfully");
        form.resetFields();
        setOpen(false);
        router.refresh();
      } else {
        msgApi.error(res.error || "Failed to create author");
      }
    });
  };

  return (
    <>
      {contextHolder}
      <Button 
        type="primary" 
        icon={<Plus size={16} />} 
        onClick={() => setOpen(true)}
        className="bg-blue-600 flex items-center gap-2 !rounded-lg h-10 px-5 font-medium shadow-sm"
      >
        New Author
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2 pt-2 pb-4">
            <UserPlus size={20} className="text-blue-600" />
            <Title level={4} className="!m-0">Create New Author</Title>
          </div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        destroyOnHidden
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="pt-2"
        >
          <Form.Item
            name="name"
            label={<Text strong>Full Name</Text>}
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="e.g., Jane Doe" className="!rounded-lg" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label={<Text strong>Creator Role</Text>}
              >
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
              <Form.Item
                name="website"
                label={<Text strong>Website</Text>}
              >
                <Input placeholder="https://..." className="!rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={<Text strong>Avatar Image</Text>}
            required
          >
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
                        <Button icon={<UploadIcon size={16} />} className="w-full !rounded-lg h-10 bg-[var(--input)] border-[var(--border)] text-[var(--foreground)]">
                          Choose File
                        </Button>
                      </Upload>
                    </ImgCrop>
                    {avatarUrl && avatarUrl.startsWith("data:") && (
                      <Button 
                        icon={<X size={16} />} 
                        danger 
                        onClick={() => form.setFieldsValue({ avatarUrl: null })}
                        className="!rounded-lg h-10 w-10 flex items-center justify-center"
                      />
                    )}
                  </div>
                </Form.Item>
              ) : (
                <Form.Item name="avatarUrl" noStyle>
                  <Input 
                    placeholder="https://example.com/avatar.png" 
                    className="!rounded-lg h-10 !bg-[var(--input)] !border-[var(--border)] text-[var(--foreground)]" 
                    prefix={<LinkIcon size={14} className="text-[var(--sidebar-text)]" />}
                  />
                </Form.Item>
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="bio"
            label={<Text strong className="text-[var(--foreground)]">Short Biography</Text>}
          >
            <TextArea rows={3} placeholder="Tell us about this creator..." className="!rounded-lg !bg-[var(--input)] !border-[var(--border)] text-[var(--foreground)]" />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)] mt-6">
            <Button 
              onClick={() => setOpen(false)} 
              icon={<X size={16} />} 
              className="flex items-center gap-2 !rounded-lg !h-10 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isPending} 
              icon={<Save size={16} />}
              className="flex items-center gap-2 !rounded-lg !h-10 px-8 bg-blue-600 border-none"
            >
              Create Author
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

