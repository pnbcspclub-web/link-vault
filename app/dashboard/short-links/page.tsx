import { prisma } from "@/lib/db";
import ShortLinksClient from "./ShortLinksClient";

export const dynamic = "force-dynamic";

export default async function ShortLinksPage() {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      shortCode: true,
      originalUrl: true,
      title: true,
      format: true,
      createdAt: true,
    }
  });

  // Convert dates to ISO strings for client component if necessary
  const serializedLinks = links.map(link => ({
    ...link,
    createdAt: link.createdAt.toISOString(),
  }));

  return <ShortLinksClient initialLinks={serializedLinks} />;
}
