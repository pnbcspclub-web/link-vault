import { prisma } from "@/lib/db";
import PageHeader from "../components/PageHeader";
import PlatformsClient from "./PlatformsClient";

export const dynamic = "force-dynamic";

export default async function PlatformsPage() {
  const links = await prisma.link.findMany({
    select: {
      format: true,
    }
  });

  const counts: Record<string, number> = {};
  links.forEach(l => {
    const f = l.format || "Web";
    counts[f] = (counts[f] || 0) + 1;
  });

  const platforms = Object.entries(counts).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="lv-page">
      <PageHeader 
        eyebrow="Library" 
        title="Platforms" 
        description="Filter and navigate links by media format or source platform."
      />

      <PlatformsClient platforms={platforms} />
    </div>
  );
}
