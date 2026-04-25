"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Modal, Input, type InputRef } from "antd";
import { Search, Command, ArrowRight } from "lucide-react";
import { searchGlobal } from "./actions";

const ACTIONS = [
  { id: "new", label: "Create new link", hint: "Open new link page", action: "new" },
  { id: "export", label: "Export JSON", hint: "Download all links", action: "export" },
  { id: "vault", label: "Go to vault", hint: "View saved links", action: "/dashboard/vault" },
  { id: "tags", label: "Go to tags", hint: "Browse tags", action: "/dashboard/tags" },
  { id: "categories", label: "Go to categories", hint: "Browse categories", action: "/dashboard/categories" },
  { id: "settings", label: "Settings", hint: "Preferences", action: "/dashboard/settings" },
  { id: "dashboard", label: "Overview", hint: "Insights", action: "/dashboard" }
];

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dynamicResults, setDynamicResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<InputRef | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length >= 2) {
        const results = await searchGlobal(query);
        setDynamicResults(results);
      } else {
        setDynamicResults([]);
      }
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ACTIONS.filter((item) => item.label.toLowerCase().includes(q)) : ACTIONS;
  }, [query]);

  const allResults = useMemo(() => {
    return [...dynamicResults, ...filteredActions];
  }, [dynamicResults, filteredActions]);

  const safeIndex = allResults.length === 0 ? 0 : Math.min(selectedIndex, allResults.length - 1);

  const runAction = (action: string) => {
    setOpen(false);
    setQuery("");
    
    if (action === "export") {
      router.push("/api/export");
      return;
    }

    if (action === "new") {
      router.push(pathname + "?new=true");
      return;
    }

    if (action.startsWith("/")) {
      router.push(action);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (allResults.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((safeIndex + 1) % allResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((safeIndex - 1 + allResults.length) % allResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allResults[safeIndex]) {
        runAction(allResults[safeIndex].action);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-4 py-2 bg-[var(--input)] border border-[var(--border)] rounded-xl cursor-pointer hover:border-blue-400 transition-all group"
      >
        <Search size={16} className="text-[var(--sidebar-text)] group-hover:text-blue-500" />
        <span className="text-[var(--sidebar-text)] text-sm flex-1">Search commands...</span>
        <div className="flex items-center gap-1 bg-[var(--muted)] px-1.5 py-0.5 rounded border border-[var(--border)]">
          <Command size={10} className="text-[var(--sidebar-text)]" />
          <span className="text-[10px] font-bold text-[var(--sidebar-text)]">K</span>
        </div>
      </div>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        closable={false}
        destroyOnHidden
        className="lv-modal !top-20"
        width={600}
        styles={{ body: { padding: 0 } }}
      >
        <div className="p-4 border-b border-[var(--border)]">
          <Input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            prefix={<Search size={20} className="text-[var(--sidebar-text)] mr-2" />}
            variant="borderless"
            className="!text-lg !py-2 !bg-transparent"
          />
        </div>
        
        <div className="max-h-[400px] overflow-y-auto pb-2 bg-[var(--card)]">
          {allResults.length > 0 ? (
            <div className="px-2">
              {allResults.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => runAction(item.action)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    index === safeIndex ? "bg-blue-600/10 text-blue-600" : "hover:bg-[var(--muted)]"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-medium ${index === safeIndex ? "text-blue-600" : "text-[var(--foreground)]"}`}>
                      {item.label}
                    </span>
                    <span className="text-xs opacity-70 text-[var(--sidebar-text)]">{item.hint}</span>
                  </div>
                  {index === safeIndex && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-blue-600">Enter</span>
                      <ArrowRight size={14} className="text-blue-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-[var(--sidebar-text)]">
              No matching commands found
            </div>
          )}
        </div>
        
        <div className="p-3 bg-[var(--muted)] border-t border-[var(--border)] flex items-center justify-between rounded-b-2xl">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="bg-[var(--card)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm text-[var(--foreground)]">↑↓</span>
              <span className="text-[10px] text-[var(--sidebar-text)] font-medium">Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-[var(--card)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm text-[var(--foreground)]">Enter</span>
              <span className="text-[10px] text-[var(--sidebar-text)] font-medium">Select</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-[var(--card)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm text-[var(--foreground)]">Esc</span>
            <span className="text-[10px] text-[var(--sidebar-text)] font-medium">Close</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
