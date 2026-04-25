"use client";

import { useState, useTransition } from "react";
import { Button, Form, Input, Modal, message, Typography, Select, Row, Col, ColorPicker } from "antd";
import { Plus, Hash, Save, X } from "lucide-react";
import { createTag } from "../actions";
import { useRouter } from "next/navigation";

const { Text, Title } = Typography;
const { TextArea } = Input;

type TagFormValues = {
  name: string;
  description?: string;
  color?: string;
  categoryId?: string | null;
};

type TagManagerProps = {
  categories: Array<{ id: string; name: string }>;
};

const COLOR_PRESETS = [
  { label: 'Blue', color: '#2563eb' },
  { label: 'Orange', color: '#f97316' },
  { label: 'Red', color: '#ef4444' },
  { label: 'Green', color: '#22c55e' },
  { label: 'Purple', color: '#8b5cf6' },
  { label: 'Cyan', color: '#06b6d4' },
];

export default function TagManager({ categories }: TagManagerProps) {
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const onFinish = (values: TagFormValues & { colorObj?: any }) => {
    // Convert color object to hex string if needed
    const finalValues = {
      ...values,
      color: values.colorObj ? (typeof values.colorObj === 'string' ? values.colorObj : values.colorObj.toHexString()) : undefined
    };
    delete (finalValues as any).colorObj;

    startTransition(async () => {
      const res = await createTag(finalValues);
      if (res.ok) {
        msgApi.success("Tag created successfully");
        form.resetFields();
        setOpen(false);
        router.refresh();
      } else {
        msgApi.error(res.error || "Failed to create tag");
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
        New Tag
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2 pt-2 pb-4">
            <Hash size={20} className="text-blue-600" />
            <Title level={4} className="!m-0">Create New Tag</Title>
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
          initialValues={{ colorObj: '#2563eb' }}
          className="pt-2"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={<Text strong>Tag Name</Text>}
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input placeholder="typescript" className="!rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label={<Text strong>Category</Text>}
              >
                <Select
                  placeholder="Select category"
                  allowClear
                  options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
                  className="!rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={<Text strong>Description (Optional)</Text>}
          >
            <TextArea rows={2} placeholder="Briefly describe what this tag represents" className="!rounded-lg" />
          </Form.Item>

          <Form.Item
            name="colorObj"
            label={<Text strong>Tag Accent Color</Text>}
            getValueFromEvent={(color) => color.toHexString()}
          >
            <ColorPicker 
              showText 
              presets={[{ label: 'Presets', colors: COLOR_PRESETS.map(p => p.color) }]} 
              className="!w-full !rounded-lg"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
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
              className="flex items-center gap-2 !rounded-lg !h-10 px-8 bg-blue-600"
            >
              Create Tag
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

