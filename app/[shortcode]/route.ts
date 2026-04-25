import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";

const getLinkByShortCode = (shortCode: string) => unstable_cache(
  async () => {
    return prisma.link.findUnique({
      where: { shortCode },
      select: { originalUrl: true }
    });
  },
  [`short-code-${shortCode}`],
  { 
    revalidate: 3600,
    tags: ['short-links', `short-code-${shortCode}`]
  }
)();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shortcode: string }> }
) {
  const { shortcode } = await params;
  const link = await getLinkByShortCode(shortcode);

  if (!link) {
    return new Response("Not Found", { status: 404 });
  }

  redirect(link.originalUrl);
}