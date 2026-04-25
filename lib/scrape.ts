import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import * as cheerio from "cheerio";

export type ScrapeResult = {
  title: string;
  description?: string;
  image?: string;
  contentArchive?: string;
  author?: string;
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
];

export async function scrapeUrl(targetUrl: string): Promise<ScrapeResult> {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      console.warn(`Failed to fetch ${targetUrl}: ${res.status} ${res.statusText}`);
      return { title: targetUrl };
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Title extraction
    const ogTitle = $("meta[property=\"og:title\"]").attr("content");
    const twitterTitle = $("meta[name=\"twitter:title\"]").attr("content");
    const metaTitle = $("title").first().text().trim();
    
    // Description extraction
    const ogDesc = $("meta[property=\"og:description\"]").attr("content");
    const twitterDesc = $("meta[name=\"twitter:description\"]").attr("content");
    const metaDesc = $("meta[name=\"description\"]").attr("content")?.trim();
    
    // Image extraction
    let ogImage = $("meta[property=\"og:image\"]").attr("content") || 
                  $("meta[name=\"twitter:image\"]").attr("content") ||
                  $("link[rel=\"image_src\"]").attr("href");
                  
    if (ogImage && !ogImage.startsWith("http")) {
      ogImage = new URL(ogImage, targetUrl).toString();
    }

    const dom = new JSDOM(html, { url: targetUrl });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    return {
      title: article?.title || ogTitle || twitterTitle || metaTitle || targetUrl,
      description: ogDesc || twitterDesc || metaDesc || article?.excerpt || undefined,
      image: ogImage,
      contentArchive: article?.textContent || undefined,
      author: article?.byline || undefined
    };
  } catch (error) {
    console.error(`Scraping error for ${targetUrl}:`, error);
    return { title: targetUrl };
  }
}
