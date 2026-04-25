import { prisma } from "@/lib/db";
import PageHeader from "../components/PageHeader";
import AuthorManager from "../components/AuthorManager";
import AuthorsClient from "./AuthorsClient";

export const dynamic = "force-dynamic";

export default async function AuthorsPage() {
  const authorsRaw = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: { 
      _count: { select: { links: true } },
      links: { select: { tags: { select: { id: true } } } }
    }
  });

  const authors = authorsRaw.map((author) => {
    const tagIds = new Set<string>();
    author.links.forEach((link) => {
      link.tags.forEach((tag) => tagIds.add(tag.id));
    });

    return {
      ...author,
      tagCount: tagIds.size
    };
  });

  return (
    <div className="lv-page">
      <PageHeader 
        eyebrow="Library" 
        title="Authors" 
        description="People and creators behind the content."
        extra={<AuthorManager />}
      />

      <AuthorsClient authors={authors} />
    </div>
  );
}
