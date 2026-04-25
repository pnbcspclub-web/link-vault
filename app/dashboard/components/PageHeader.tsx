"use client";

import { Typography } from "antd";
import { ReactNode } from "react";

const { Text, Title } = Typography;

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  extra?: ReactNode;
}

export default function PageHeader({ eyebrow, title, description, extra }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        {eyebrow && (
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-0.5">
            {eyebrow}
          </div>
        )}
        <Title 
          level={2} 
          className="!m-0 !text-2xl !font-black !tracking-tight !text-[var(--foreground)]"
        >
          {title}
        </Title>
        {description && (
          <Text className="text-[var(--sidebar-text)] text-sm mt-0.5 block">
            {description}
          </Text>
        )}
      </div>
      {extra && (
        <div className="shrink-0 flex items-center">
          {extra}
        </div>
      )}
    </div>
  );
}
