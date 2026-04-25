"use server";

import { prisma } from "@/lib/db";

export async function getExistingTags() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, categoryId: true, category: { select: { name: true } } }
    });
    return tags.map(t => ({
      id: t.id,
      name: t.name,
      categoryId: t.categoryId,
      categoryName: t.category?.name || null
    }));
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
}

export async function searchGlobal(query: string) {
  if (!query || query.length < 2) return [];
  
  try {
    const [links, authors, tags] = await Promise.all([
      prisma.link.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } }
          ]
        },
        take: 5,
        select: { id: true, title: true, format: true }
      }),
      prisma.author.findMany({
        where: { name: { contains: query } },
        take: 3,
        select: { id: true, name: true }
      }),
      prisma.tag.findMany({
        where: { name: { contains: query } },
        take: 3,
        select: { id: true, name: true }
      })
    ]);

    const results = [
      ...links.map(l => ({ id: l.id, label: l.title, hint: `Resource (${l.format})`, action: `/dashboard/vault?q=${l.title}` })),
      ...authors.map(a => ({ id: a.id, label: a.name, hint: "Author", action: `/dashboard/vault?author=${a.name}` })),
      ...tags.map(t => ({ id: t.id, label: t.name, hint: "Tag", action: `/dashboard/vault?tagId=${t.id}` }))
    ];

    return results;
  } catch (error) {
    console.error("Global search failed:", error);
    return [];
  }
}
