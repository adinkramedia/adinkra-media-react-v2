// src/pages/NewsArticle.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import Header from "../components/Header";
import Footer from "../components/Footer";

const client = createClient({
  space: "8e41pkw4is56",
  accessToken: "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I",
});

const options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.HEADING_1]: (node, children) => (
      <h1 className="text-3xl font-bold mb-6">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="text-2xl font-semibold mb-4">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-xl font-semibold mb-3">{children}</h3>
    ),
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-5 leading-relaxed">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc pl-6 mb-5">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal pl-6 mb-5">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => <li>{children}</li>,
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-adinkra-highlight pl-4 italic text-adinkra-highlight mb-6">
        {children}
      </blockquote>
    ),
  },
};

export default function NewsArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    client
      .getEntry(id)
      .then((entry) => {
        setArticle(entry);
        console.log("Contentful article fields:", entry.fields);
      })
      .catch(console.error);
  }, [id]);

  if (!article) return <div className="text-center py-20">Loading...</div>;

  const {
    newsArticle,
    slug,
    coverImage,
    summaryexcerpt,
    author,
    BodyContent,
    tagscategory,
    featured,
    category,
    mediaAssets,
    date,
  } = article.fields;

  const coverUrl = coverImage?.fields?.file?.url;
  const mediaFiles = mediaAssets || [];

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />
      <section className="max-w-4xl mx-auto px-6 py-20">
        {/* Cover Image */}
        {coverUrl && (
          <img
            src={`https:${coverUrl}`}
            alt={newsArticle}
            className="w-full rounded-lg mb-6"
          />
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">{newsArticle}</h1>

        {/* Author + Date + Category */}
        <p className="text-sm text-adinkra-gold/70 mb-4">
          {author?.fields?.name ? `By ${author.fields.name}` : "By Adinkra Media"} |{" "}
          {date ? new Date(date).toLocaleDateString() : ""} • {category}
        </p>

        {/* Summary/Excerpt */}
        {summaryexcerpt && (
          <p className="italic text-adinkra-gold/80 mb-8">{summaryexcerpt}</p>
        )}

        {/* Body Content */}
        {BodyContent && (
          <div className="prose prose-invert prose-lg text-adinkra-gold max-w-none mb-12">
            {documentToReactComponents(BodyContent, options)}
          </div>
        )}

        {/* Media Assets */}
        {mediaFiles.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-4 text-adinkra-highlight">
              Media
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {mediaFiles.map((asset, i) => {
                const file = asset.fields.file;
                const url = `https:${file.url}`;
                const contentType = file.contentType;

                if (contentType.startsWith("image")) {
                  return (
                    <img
                      key={i}
                      src={url}
                      alt={asset.fields.title || "Media"}
                      className="w-full rounded"
                    />
                  );
                } else if (contentType.startsWith("video")) {
                  return (
                    <video key={i} src={url} controls className="w-full rounded" />
                  );
                } else if (contentType.startsWith("audio")) {
                  return (
                    <audio key={i} src={url} controls className="w-full" />
                  );
                } else {
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-adinkra-highlight underline"
                    >
                      Download File ({file.fileName})
                    </a>
                  );
                }
              })}
            </div>
          </div>
        )}
      </section>
      
    </div>
  );
}
