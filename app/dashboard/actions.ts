"use server";

import { prisma } from "@/lib/db";
import { scrapeUrl } from "@/lib/scrape";
import { AuthorType, Format } from "../../generated/client";
import { revalidatePath } from "next/cache";

export async function autoFetch(url: string) {
  if (!url) return null;
  const result = await scrapeUrl(url);
  return result;
}

// Author Actions
export async function getAuthors() {
  return prisma.author.findMany({ orderBy: { name: "asc" } });
}

export async function createAuthor(data: { name: string; type?: string; avatarUrl?: string; bio?: string; website?: string }) {
  try {
    const author = await prisma.author.create({ 
      data: { ...data, type: data.type as AuthorType | undefined } 
    });
    revalidatePath("/dashboard/authors");
    return { ok: true, data: author };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create author";
    return { ok: false, error: message };
  }
}

export async function updateAuthor(id: string, data: { name: string; type?: string; avatarUrl?: string; bio?: string; website?: string }) {
  try {
    const author = await prisma.author.update({ 
      where: { id }, 
      data: { ...data, type: data.type as AuthorType | undefined } 
    });
    revalidatePath("/dashboard/authors");
    revalidatePath("/dashboard/vault");
    return { ok: true, data: author };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update author";
    return { ok: false, error: message };
  }
}

export async function deleteAuthor(id: string) {
  try {
    await prisma.link.updateMany({ where: { authorId: id }, data: { authorId: null } });
    await prisma.author.delete({ where: { id } });
    revalidatePath("/dashboard/authors");
    revalidatePath("/dashboard/vault");
    return { ok: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete author";
    return { ok: false, error: message };
  }
}

// Category Actions
export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(data: { name: string; description?: string; icon?: string }) {
  try {
    const category = await prisma.category.create({ data });
    revalidatePath("/dashboard/categories");
    return { ok: true, data: category };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return { ok: false, error: message };
  }
}

export async function updateCategory(id: string, data: { name: string; description?: string; icon?: string }) {
  try {
    const category = await prisma.category.update({ where: { id }, data });
    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/vault");
    revalidatePath("/dashboard/tags");
    return { ok: true, data: category };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    return { ok: false, error: message };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.link.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
      await tx.tag.deleteMany({ where: { categoryId: id } });
      await tx.category.delete({ where: { id } });
    });
    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/vault");
    revalidatePath("/dashboard/tags");
    return { ok: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return { ok: false, error: message };
  }
}

// Tag Actions
export async function getTags() {
  return prisma.tag.findMany({ orderBy: { name: "asc" }, include: { category: true } });
}

export async function createTag(data: { name: string; description?: string; color?: string; categoryId?: string | null }) {
  try {
    const tag = await prisma.tag.create({ data });
    revalidatePath("/dashboard/tags");
    return { ok: true, data: tag };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create tag";
    return { ok: false, error: message };
  }
}

export async function updateTag(id: string, data: { name: string; description?: string; color?: string; categoryId?: string | null }) {
  try {
    const tag = await prisma.tag.update({ where: { id }, data });
    revalidatePath("/dashboard/tags");
    revalidatePath("/dashboard/vault");
    return { ok: true, data: tag };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update tag";
    return { ok: false, error: message };
  }
}

export async function deleteTag(id: string) {
  try {
    await prisma.tag.delete({ where: { id } });
    revalidatePath("/dashboard/tags");
    revalidatePath("/dashboard/vault");
    return { ok: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete tag";
    return { ok: false, error: message };
  }
}

export async function createLink(formData: FormData) {
  const originalUrl = formData.get("originalUrl")?.toString() ?? "";
  const title = formData.get("title")?.toString() ?? "";
  const description = formData.get("description")?.toString() ?? undefined;
  const image = formData.get("image")?.toString() ?? undefined;
  const contentArchive = formData.get("contentArchive")?.toString() ?? undefined;
  const notes = formData.get("notes")?.toString() ?? undefined;
  const shortCode = formData.get("shortCode")?.toString() ?? "";
  const format = (formData.get("format")?.toString() ?? "Web") as Format;
  
  const authorId = formData.get("authorId")?.toString();
  const categoryId = formData.get("categoryId")?.toString();
  const tagsInput = formData.get("tags")?.toString() ?? "";

  if (!originalUrl || !title || !shortCode) {
    return { ok: false, error: "Missing required fields" };
  }

  // Prevent Duplicate Links
  const existingLink = await prisma.link.findFirst({
    where: { originalUrl }
  });

  if (existingLink) {
    return { ok: false, error: "This URL is already in your vault" };
  }

  const tagNames = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

  try {
    // Ensure all tags exist and get their IDs
    const tagRecords = await Promise.all(
      tagNames.map(async (name) => {
        const where = { name, categoryId: categoryId || null };
        const existing = await prisma.tag.findFirst({ where });
        if (existing) return existing;
        return prisma.tag.create({ data: where });
      })
    );

    await prisma.link.create({
      data: {
        originalUrl,
        title,
        description,
        image,
        contentArchive,
        notes,
        shortCode,
        format,
        authorId: authorId || undefined,
        categoryId: categoryId || undefined,
        tags: {
          connect: tagRecords.map((t) => ({ id: t.id }))
        }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error: unknown) {
    console.error("Create link error:", error);
    const message = error instanceof Error ? error.message : "Failed to create link";
    return { ok: false, error: message };
  }
}

export async function updateLink(id: string, formData: FormData) {
  const title = formData.get("title")?.toString() ?? "";
  const description = formData.get("description")?.toString() ?? undefined;
  const image = formData.get("image")?.toString() ?? undefined;
  const notes = formData.get("notes")?.toString() ?? undefined;
  const format = (formData.get("format")?.toString() ?? "Web") as Format;
  
  const authorId = formData.get("authorId")?.toString();
  const categoryId = formData.get("categoryId")?.toString();
  const tagsInput = formData.get("tags")?.toString() ?? "";

  if (!title) {
    return { ok: false, error: "Title is required" };
  }

  const tagNames = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

  try {
    // Ensure all tags exist and get their IDs
    const tagRecords = await Promise.all(
      tagNames.map(async (name) => {
        const where = { name, categoryId: categoryId || null };
        const existing = await prisma.tag.findFirst({ where });
        if (existing) return existing;
        return prisma.tag.create({ data: where });
      })
    );

    await prisma.link.update({
      where: { id },
      data: {
        title,
        description,
        image,
        notes,
        format,
        authorId: authorId || null,
        categoryId: categoryId || null,
        tags: {
          set: [], // Clear existing tags
          connect: tagRecords.map((t) => ({ id: t.id }))
        }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error: unknown) {
    console.error("Update link error:", error);
    const message = error instanceof Error ? error.message : "Failed to update link";
    return { ok: false, error: message };
  }
}

export async function deleteLink(id: string) {
  try {
    await prisma.link.delete({
      where: { id }
    });
    
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to delete link" };
  }
}
