import { prisma } from "@/lib/db";
import PageHeader from "../components/PageHeader";
import TagManager from "../components/TagManager";
import TagsClient from "./TagsClient";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const [tags, categories] = await Promise.all([
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { links: true } }, category: true }
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="lv-page">
      <PageHeader 
        eyebrow="Library" 
        title="Tags" 
        description="All tags across your vault."
        extra={<TagManager categories={categories} />}
      />

      <TagsClient tags={tags} categories={categories} />
    </div>
  );
}
