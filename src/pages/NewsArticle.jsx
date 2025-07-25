import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { supabase } from "../lib/supabase";
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
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-5 leading-relaxed">{children}</p>
    ),
  },
};

export default function NewsArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);

  useEffect(() => {
    client
      .getEntry(id)
      .then((entry) => {
        setArticle(entry);
        fetchLikes(entry.fields.slug || entry.sys.id);
        updateMetaTags(entry);
      })
      .catch(console.error);
  }, [id]);

  const fetchLikes = async (slug) => {
    const { data, error } = await supabase
      .from("likes")
      .select("count")
      .eq("slug", slug)
      .maybeSingle();

    if (data) setLikeCount(data.count || 0);
    else if (error && error.code !== "PGRST116") {
      console.error("Fetch error:", error);
    }
  };

  const handleLike = async () => {
    if (!article) return;
    const slug = article.fields.slug || article.sys.id;
    setLoadingLike(true);

    const { data: existing, error: fetchError } = await supabase
      .from("likes")
      .select("id, count")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing && fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch error:", fetchError);
      setLoadingLike(false);
      return;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("likes")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);

      if (!updateError) setLikeCount(existing.count + 1);
      else console.error("Update error:", updateError);
    } else {
      const { error: insertError } = await supabase
        .from("likes")
        .insert({
          slug,
          type: "news",
          count: 1,
        });

      if (!insertError) setLikeCount(1);
      else console.error("Insert error:", insertError);
    }

    setLoadingLike(false);
  };

  const updateMetaTags = (entry) => {
    const title = entry.fields.newsArticle;
    const description = entry.fields.summaryexcerpt || "Adinkra Media article";
    const image = entry.fields.coverImage?.fields?.file?.url
      ? `https:${entry.fields.coverImage.fields.file.url}`
      : "";

    const setMeta = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:image", image);
    setMeta("og:type", "article");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: newsArticle,
        text: summaryexcerpt,
        url: fullUrl,
      });
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  if (!article) return <div className="text-center py-20">Loading...</div>;

  const {
    newsArticle,
    slug,
    coverImage,
    summaryexcerpt,
    author,
    BodyContent,
    category,
    mediaAssets,
    date,
  } = article.fields;

  const coverUrl = coverImage?.fields?.file?.url;
  const mediaFiles = mediaAssets || [];
  const fullUrl = `https://adinkramedia.com/news/${article.sys.id}`;

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />
      <section className="max-w-4xl mx-auto px-6 py-20">
        {/* Cover */}
        {coverUrl && (
          <img
            src={`https:${coverUrl}`}
            alt={newsArticle}
            className="w-full rounded-lg mb-6"
          />
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">{newsArticle}</h1>
        <p className="text-sm text-adinkra-gold/70 mb-6">
          {author?.fields?.name ? `By ${author.fields.name}` : "By Adinkra Media"} |{" "}
          {date ? new Date(date).toLocaleDateString() : ""} • {category}
        </p>

        {/* Like + Share */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <button
            onClick={handleLike}
            disabled={loadingLike}
            className="bg-adinkra-highlight text-black px-4 py-2 rounded-full hover:bg-yellow-400"
          >
            {loadingLike ? "Liking..." : "👍 Like"} ({likeCount})
          </button>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-adinkra-card px-4 py-2 rounded-full text-adinkra-highlight hover:underline"
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${fullUrl}&text=${encodeURIComponent(newsArticle + " - " + summaryexcerpt)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-adinkra-card px-4 py-2 rounded-full text-adinkra-highlight hover:underline"
          >
            Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${fullUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-adinkra-card px-4 py-2 rounded-full text-adinkra-highlight hover:underline"
          >
            LinkedIn
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(newsArticle + " - " + summaryexcerpt + " " + fullUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-adinkra-card px-4 py-2 rounded-full text-adinkra-highlight hover:underline"
          >
            WhatsApp
          </a>
          <button
            onClick={handleNativeShare}
            className="bg-adinkra-card px-4 py-2 rounded-full text-adinkra-highlight hover:underline"
          >
            Share...
          </button>
        </div>

        {/* Summary */}
        {summaryexcerpt && (
          <p className="italic text-adinkra-gold/80 mb-8">{summaryexcerpt}</p>
        )}

        {/* Body */}
        <div className="prose prose-invert prose-lg text-adinkra-gold max-w-none mb-12">
          {documentToReactComponents(BodyContent, options)}
        </div>

        {/* Media Section */}
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
                  return <video key={i} src={url} controls className="w-full rounded" />;
                } else if (contentType.startsWith("audio")) {
                  return <audio key={i} src={url} controls className="w-full" />;
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
