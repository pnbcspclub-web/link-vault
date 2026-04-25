import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapeUrl } from "@/lib/scrape";
import { Format } from "../../../generated/client";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    originalUrl,
    shortCode,
    notes,
    tags = [],
    category,
    format = "Web"
  } = body ?? {};

  if (!originalUrl || !shortCode) {
    return NextResponse.json(
      { error: "originalUrl and shortCode required" },
      { status: 400 }
    );
  }

  const scraped = await scrapeUrl(originalUrl);

  const categoryRecord = category
    ? await prisma.category.upsert({
        where: { name: category },
        update: {},
        create: { name: category }
      })
    : null;

  const tagRecords = await Promise.all(
    tags.map(async (name: string) => {
      const where = { name, categoryId: categoryRecord?.id || null };
      const existing = await prisma.tag.findFirst({ where });
      if (existing) return existing;
      return prisma.tag.create({ data: where });
    })
  );

  const link = await prisma.link.create({
    data: {
      originalUrl,
      shortCode,
      title: scraped.title,
      description: scraped.description,
      contentArchive: scraped.contentArchive,
      author: scraped.author ? {
        connectOrCreate: {
          where: { name: scraped.author },
          create: { name: scraped.author }
        }
      } : undefined,
      notes,
      format: format as Format,
      category: categoryRecord ? { connect: { id: categoryRecord.id } } : undefined,
      tags: { connect: tagRecords.map((t) => ({ id: t.id })) }
    }
  });

  return NextResponse.json({ ok: true, link });
}
