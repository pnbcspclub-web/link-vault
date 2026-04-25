"use client";

import { useEffect, useMemo, useState } from "react";
import { Layout, Menu, Drawer, Button } from "antd";
import {
  LayoutGrid,
  PlusCircle,
  Download,
  Menu as MenuIcon,
  Tags,
  Folder,
  Link as LinkIcon,
  FileText,
  Settings,
  User,
  Bookmark,
  Sun,
  Moon
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import CommandPalette from "./CommandPalette";
import LinkForm from "../LinkForm";
import { getExistingTags } from "./actions";

const { Sider, Content } = Layout;

type MenuItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
};

// Fixed imports and theme toggle
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setTheme, resolvedTheme } = useTheme();

  const autoOpen = searchParams.get("new") === "true";
  const initialUrl = searchParams.get("url") || undefined;
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isNewLinkModalOpen, setIsNewLinkModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [existingTags, setExistingTags] = useState<Array<{ id: string; name: string; categoryId: string | null; categoryName: string | null }>>([]);

  useEffect(() => {
    setMounted(true);
    getExistingTags().then(setExistingTags);
  }, []);

  const menuItems: MenuItem[] = useMemo(() => [
    { key: "/dashboard", icon: <LayoutGrid size={18} />, label: "Overview", href: "/dashboard" },
    { key: "/dashboard/vault", icon: <FileText size={18} />, label: "Vault", href: "/dashboard/vault" },
    { key: "/dashboard/short-links", icon: <LinkIcon size={18} />, label: "Short Links", href: "/dashboard/short-links" },
    { key: "/dashboard/authors", icon: <User size={18} />, label: "Authors", href: "/dashboard/authors" },
    { key: "/dashboard/tags", icon: <Tags size={18} />, label: "Tags", href: "/dashboard/tags" },
    { key: "/dashboard/categories", icon: <Folder size={18} />, label: "Categories", href: "/dashboard/categories" },
    { key: "/dashboard/settings", icon: <Settings size={18} />, label: "Settings", href: "/dashboard/settings" },
    { key: "export", icon: <Download size={18} />, label: "Export Data", href: "/api/export" },
  ], []);

  const selectedKey = useMemo(() => {
    if (!pathname) return "/dashboard";
    if (pathname.startsWith("/dashboard/vault")) return "/dashboard/vault";
    if (pathname.startsWith("/dashboard/authors")) return "/dashboard/authors";
    if (pathname.startsWith("/dashboard/tags")) return "/dashboard/tags";
    if (pathname.startsWith("/dashboard/categories")) return "/dashboard/categories";
    if (pathname.startsWith("/dashboard/settings")) return "/dashboard/settings";
    if (pathname.startsWith("/dashboard/short-links")) return "/dashboard/short-links";
    return "/dashboard";
  }, [pathname]);

  const onMenuClick = (key: string) => {
    const item = menuItems.find((m) => m.key === key);
    if (!item) return;

    if (item.onClick) {
      item.onClick();
      return;
    }

    if (item.href?.startsWith("/")) {
      router.push(item.href);
    }
    setDrawerOpen(false);
  };

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        className: "lv-menu-item"
      }))}
      onClick={(info) => onMenuClick(info.key)}
      className="!border-r-0 !bg-transparent"
    />
  );

  return (
    <Layout className="lv-shell min-h-screen">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={260}
        theme="light"
        className="lv-sider hidden lg:block"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          height: '100vh',
        }}
        trigger={null}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-8 py-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Bookmark size={20} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-[var(--foreground)] text-xl leading-none">
                LinkVault
              </span>
              <span className="text-[10px] text-[var(--sidebar-text)] font-medium uppercase tracking-widest mt-1">
                Personal Library
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
            {menu}
          </div>
        </div>
      </Sider>

      <Layout className="lv-main" style={{ marginLeft: 0, minHeight: '100vh' }}>
        <div className="lg:ml-[260px] transition-all duration-300">
          <div className="lv-topbar sticky top-0 z-40 flex items-center justify-between px-6 lg:px-10 py-4">
            <div className="flex items-center gap-6 flex-1">
              <Button
                type="text"
                icon={<MenuIcon size={20} />}
                onClick={() => setDrawerOpen(true)}
                className="lg:!hidden !flex items-center justify-center !w-10 !h-10 !rounded-xl text-[var(--foreground)]"
              />
              <div className="hidden md:block w-full max-w-xl">
                <CommandPalette />
              </div>
            </div>

            <div className="flex items-center gap-3">
               <Button
                type="text"
                icon={mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="!w-10 !h-10 !rounded-xl flex items-center justify-center text-[var(--foreground)]"
              />
               <Button 
                type="primary" 
                icon={<PlusCircle size={18} />}
                onClick={() => setIsNewLinkModalOpen(true)}
                className="!h-10 px-5 !rounded-xl font-bold text-xs"
              >
                New Link
              </Button>
            </div>
          </div>
          
          <Content className="p-6 md:p-8 lg:p-12 w-full">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </Content>
        </div>
      </Layout>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        size="default"
        closeIcon={null}
        title={
          <div className="flex items-center gap-2.5 py-1">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <Bookmark size={16} fill="currentColor" />
            </div>
            <span className="font-bold text-base text-[var(--foreground)]">LinkVault</span>
          </div>
        }
        className="lv-drawer lg:hidden"
        styles={{ body: { padding: "8px 0" } }}
      >
        <div className="px-2 py-2">
           {menu}
        </div>
      </Drawer>

      {/* Global Link Form Modal */}
      {(isNewLinkModalOpen || autoOpen) && (
        <LinkForm 
          existingTags={existingTags} 
          initialUrl={initialUrl}
          autoOpen={true} 
          onClose={() => {
            setIsNewLinkModalOpen(false);
            if (autoOpen) {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("new");
              params.delete("url");
              const newUrl = pathname + (params.toString() ? `?${params.toString()}` : "");
              router.replace(newUrl);
            }
          }} 
        />
      )}
    </Layout>
  );
}
