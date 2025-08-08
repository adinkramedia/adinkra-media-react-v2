// scripts/generate-rss.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from "contentful";
import RSS from "rss";

// Load environment variables
dotenv.config();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Contentful client
const client = createClient({
  space: process.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: process.env.VITE_CONTENTFUL_DELIVERY_TOKEN,
});

async function generateRSS() {
  try {
    const feed = new RSS({
      title: "Adinkra Media – African Trending News",
      description: "Latest news and commentary from Adinkra Media",
      site_url: "https://www.adinkramedia.com",
      feed_url: "https://www.adinkramedia.com/rss.xml",
      language: "en",
      pubDate: new Date().toUTCString(),
    });

    const entries = await client.getEntries({
      content_type: "africanTrendingNews", // ✅ fixed content type ID
      order: "-fields.date", // ✅ fixed to match 'date'
      limit: 20,
    });

    if (!entries.items.length) {
      console.warn("⚠️ No news articles found.");
    }

    entries.items.forEach((item) => {
      const title = item.fields?.title ?? "Untitled Article";
      const slug = item.fields?.slug ?? "";
      const excerpt = item.fields?.summaryExcerpt ?? "Visit Adinkra Media for the full story.";
      const publishedDate = item.fields?.date ?? new Date().toISOString();

      feed.item({
        title,
        description: excerpt,
        url: `https://www.adinkramedia.com/news/${slug}`,
        date: new Date(publishedDate).toISOString(),
      });
    });

    const xml = feed.xml({ indent: true });
    const outputPath = path.resolve(__dirname, "../public/rss.xml");

    fs.writeFileSync(outputPath, xml, "utf8");

    console.log(`✅ RSS feed generated with ${entries.items.length} items at public/rss.xml`);
  } catch (error) {
    console.error("❌ Failed to generate RSS feed:", error.message);
    console.error(error);
  }
}

generateRSS();
