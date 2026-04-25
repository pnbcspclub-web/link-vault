"use client";

import { Lock, Shield, Database, Info } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Card, Divider, Tag, Button, Typography } from "antd";

const { Text, Title } = Typography;

export default function SettingsPage() {
  return (
    <div className="lv-page max-w-4xl">
      <PageHeader 
        eyebrow="Settings" 
        title="Preferences" 
        description="Manage your vault security and application preferences."
      />

      <div className="flex flex-col gap-8">
        {/* Security Section */}
        <Card
          className="!rounded-3xl border-[var(--border)] bg-[var(--card)]"
          title={
            <div className="flex items-center gap-2 py-1">
              <Shield size={18} className="text-blue-600" />
              <span className="font-bold text-[var(--foreground)]">Security</span>
            </div>
          }
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[var(--muted)] text-[var(--sidebar-text)] border border-[var(--border)]">
                <Lock size={20} />
              </div>
              <div>
                <Title level={5} className="!m-0 !text-sm !font-bold">Master Password</Title>
                <Text className="text-sm mt-1 text-[var(--sidebar-text)] block max-w-md">
                  Your vault is currently protected by a master password. This can be changed in your environment variables (.env).
                </Text>
              </div>
            </div>
            <Tag color="success" className="rounded-full uppercase text-[10px] font-black px-3 border-none">Active</Tag>
          </div>
        </Card>

        {/* Data Section */}
        <Card
          className="!rounded-3xl border-[var(--border)] bg-[var(--card)]"
          title={
            <div className="flex items-center gap-2 py-1">
              <Database size={18} className="text-indigo-600" />
              <span className="font-bold text-[var(--foreground)]">Data Management</span>
            </div>
          }
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[var(--muted)] text-[var(--sidebar-text)] border border-[var(--border)]">
                <Database size={20} />
              </div>
              <div>
                <Title level={5} className="!m-0 !text-sm !font-bold">Vault Export</Title>
                <Text className="text-sm mt-1 text-[var(--sidebar-text)] block max-w-md">
                  Export your entire link library, including tags, categories, and metadata, as a single JSON file for backup.
                </Text>
              </div>
            </div>
            <Button 
              type="primary" 
              href="/api/export" 
              className="!rounded-xl font-bold bg-blue-600 border-none h-10 px-6"
            >
              Export JSON
            </Button>
          </div>
        </Card>

        {/* About Section */}
        <Card
          className="!rounded-3xl border-[var(--border)] bg-[var(--card)]"
          title={
            <div className="flex items-center gap-2 py-1">
              <Info size={18} className="text-slate-500" />
              <span className="font-bold text-[var(--foreground)]">About Link Vault</span>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-1">
              <div className="flex justify-between items-center text-sm py-2">
                <Text className="text-[var(--sidebar-text)] font-medium">Version</Text>
                <Text strong className="font-mono bg-[var(--muted)] px-2 py-0.5 rounded text-xs">1.2.0 (Stable)</Text>
              </div>
              <Divider className="!my-0 opacity-50" />
              <div className="flex justify-between items-center text-sm py-2">
                <Text className="text-[var(--sidebar-text)] font-medium">Build Environment</Text>
                <Text strong>Next.js 15 + Prisma</Text>
              </div>
              <Divider className="!my-0 opacity-50" />
              <div className="flex justify-between items-center text-sm py-2">
                <Text className="text-[var(--sidebar-text)] font-medium">Database</Text>
                <Text strong>SQLite (Local-First)</Text>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
              <Text className="text-xs leading-relaxed text-blue-800 dark:text-blue-300 italic block text-center">
                &ldquo;Link Vault is your professional digital sanctuary. A place to organize, shorten, and preserve the knowledge that matters to you.&rdquo;
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
