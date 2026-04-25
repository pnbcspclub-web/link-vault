"use client";

import { useState, useTransition } from "react";
import { Button, Form, Input, Modal, message, Typography, Popover } from "antd";
import { Plus, FolderPlus, Save, X, Smile } from "lucide-react";
import { createCategory } from "../actions";
import { useRouter } from "next/navigation";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

const { Text, Title } = Typography;
const { TextArea } = Input;

type CategoryFormValues = {
  name: string;
  description?: string;
  icon?: string;
};

export default function CategoryManager({ trigger }: { trigger?: React.ReactNode }) {
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const selectedIcon = Form.useWatch("icon", form);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    form.setFieldsValue({ icon: emojiData.emoji });
  };

  const onFinish = (values: CategoryFormValues) => {
    startTransition(async () => {
      const res = await createCategory(values);
      if (res.ok) {
        msgApi.success("Category created successfully");
        form.resetFields();
        setOpen(false);
        router.refresh();
      } else {
        msgApi.error(res.error || "Failed to create category");
      }
    });
  };

  const triggerElement = trigger ? (
    <div onClick={() => setOpen(true)} className="cursor-pointer">
      {trigger}
    </div>
  ) : (
    <Button 
      type="primary" 
      icon={<Plus size={16} />} 
      onClick={() => setOpen(true)}
      className="bg-blue-600 flex items-center gap-2 !rounded-xl h-10 px-5 font-medium shadow-md shadow-blue-600/10"
    >
      New Category
    </Button>
  );

  return (
    <>
      {contextHolder}
      {triggerElement}

      <Modal
        title={
          <div className="flex items-center gap-2 pt-2 pb-4">
            <FolderPlus size={20} className="text-blue-600" />
            <Title level={4} className="!m-0">Create New Category</Title>
          </div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="pt-2"
        >
          <Form.Item
            name="name"
            label={<Text strong>Category Name</Text>}
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="e.g., Programming, AI, Design" className="!rounded-lg" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text strong>Description</Text>}
          >
            <TextArea rows={3} placeholder="What is this category about?" className="!rounded-lg" />
          </Form.Item>

          <Form.Item
            name="icon"
            label={<Text strong>Category Icon</Text>}
          >
            <Popover
              content={
                <EmojiPicker 
                  onEmojiClick={onEmojiClick} 
                  autoFocusSearch={false}
                  theme={Theme.LIGHT}
                  width={350}
                  height={400}
                />
              }
              trigger="click"
              placement="bottom"
            >
              <Button className="w-full !rounded-lg h-10 flex items-center justify-between px-3">
                <span className="text-lg">{selectedIcon || "Select an emoji"}</span>
                <Smile size={18} className="text-slate-400" />
              </Button>
            </Popover>
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
              Create Category
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}

