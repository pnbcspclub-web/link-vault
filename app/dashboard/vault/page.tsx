import VaultList from "../VaultList";
import { prisma } from "@/lib/db";
import PageHeader from "../components/PageHeader";

export const dynamic = "force-dynamic";

export default async function VaultPage({ searchParams }: { searchParams: Promise<{ author?: string }> }) {
  const { author: authorName } = await searchParams;

  const [links, tags] = await Promise.all([
    prisma.link.findMany({
      where: authorName ? {
        author: { name: authorName }
      } : {},
      orderBy: { createdAt: "desc" },
      select: { 
        id: true,
        title: true,
        description: true,
        shortCode: true,
        originalUrl: true,
        image: true,
        notes: true,
        authorId: true,
        categoryId: true,
        createdAt: true,
        format: true,
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }),
    prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        categoryId: true,
        category: {
          select: {
            name: true
          }
        }
      }
    })
  ]);

  const existingTags = tags.map(t => ({
    id: t.id,
    name: t.name,
    categoryId: t.categoryId,
    categoryName: t.category?.name || null
  }));

  return (
    <div className="lv-page">
      <PageHeader 
        eyebrow="Library" 
        title="Vault" 
        description="Browse and search everything you have saved."
      />

      <VaultList links={links as any} existingTags={existingTags} />
    </div>
  );
}
