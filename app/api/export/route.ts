import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const links = await prisma.link.findMany({
    include: { tags: true, category: true },
    orderBy: { createdAt: "desc" }
  });

  const json = JSON.stringify(links, null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=link-vault-export.json"
    }
  });
}
