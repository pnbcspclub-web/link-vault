"use client";

import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";

type NewLinkButtonProps = {
  className?: string;
  variant?: "primary" | "secondary";
};

export default function NewLinkButton({ className, variant = "primary" }: NewLinkButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(pathname + "?new=true");
  };

  if (variant === "secondary") {
    return (
      <button 
        onClick={handleClick}
        className={className}
      >
        <Plus size={18} className="text-slate-400" />
        <span className="font-semibold">New Entry</span>
      </button>
    );
  }

  return (
    <button 
      onClick={handleClick}
      className={className}
    >
      <Plus size={18} />
      <span className="font-sembold">New Entry</span>
    </button>
  );
}
