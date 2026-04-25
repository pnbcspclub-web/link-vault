import { prisma } from "@/lib/db";
import PageHeader from "../components/PageHeader";
import CategoryManager from "../components/CategoryManager";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categoriesData = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { links: true, tags: true } } }
  });

  // Map to plain objects to avoid serialization issues and ensure exact type match
  const categories = categoriesData.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    _count: cat._count
  }));

  return (
    <div className="lv-page">
      <PageHeader 
        eyebrow="Library" 
        title="Categories" 
        description="Everything grouped by topic."
        extra={<CategoryManager />}
      />

      <CategoriesClient categories={categories} />
    </div>
  );
}
