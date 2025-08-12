// src/pages/NewsArticle.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdBanner from "../components/AdBanner"; // <- your AdBanner component

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
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title, description } = node.data.target.fields;
      const url = `https:${file.url}`;
      const contentType = file.contentType;

      if (contentType.startsWith("image")) {
        return (
          <figure className="my-4">
            <img
              src={url}
              alt={title || "Affiliate image"}
              className="w-full rounded-md"
            />
            {description && (
              <figcaption className="mt-2 text-sm text-gray-500 italic">
                {description}
              </figcaption>
            )}
          </figure>
        );
      }

      if (contentType.startsWith("video")) {
        return <video src={url} controls className="w-full rounded-md my-4" />;
      }

      if (contentType.startsWith("audio")) {
        return <audio src={url} controls className="w-full my-4" />;
      }

      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-adinkra-highlight underline"
        >
          {title || file.fileName}
        </a>
      );
    },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const updateMetaTags = (entry) => {
    const title = entry.fields.newsArticle;
    const description = entry.fields.summaryexcerpt || "Adinkra Media article";
    const image = entry.fields.coverImage?.fields?.file?.url
      ? `https:${entry.fields.coverImage.fields.file.url}`
      : "";
    const fullUrl = `https://adinkramedia.com/news/${entry.sys.id}`;

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
    setMeta("og:url", fullUrl);
    setMeta("og:type", "article");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
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
    } else {
      const { error: insertError } = await supabase
        .from("likes")
        .insert({ slug, type: "news", count: 1 });

      if (!insertError) setLikeCount(1);
    }

    setLoadingLike(false);
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
    affiliateLinks,
  } = article.fields || {};

  const coverUrl = coverImage?.fields?.file?.url;
  const coverTitle = coverImage?.fields?.title;
  const coverDescription = coverImage?.fields?.description;
  const fullUrl = `https://adinkramedia.com/news/${article.sys.id}`;

  const renderBodyWithMidAd = () => {
    if (
      !BodyContent ||
      !Array.isArray(BodyContent.content) ||
      BodyContent.content.length <= 3
    ) {
      return documentToReactComponents(BodyContent, options);
    }
    const nodes = BodyContent.content;
    const splitIndex = Math.max(1, Math.ceil(nodes.length / 2));
    const firstPart = { ...BodyContent, content: nodes.slice(0, splitIndex) };
    const secondPart = { ...BodyContent, content: nodes.slice(splitIndex) };

    return (
      <>
        {documentToReactComponents(firstPart, options)}

        <div className="max-w-3xl mx-auto my-8 px-4">
          {/* Mid-article ad, unique slot */}
          <AdBanner
            slot="5581679872"
            style={{ width: "100%", height: 90 }}
            keyProp="ad-mid"
          />
        </div>

        {documentToReactComponents(secondPart, options)}
      </>
    );
  };

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />
      <section className="max-w-4xl mx-auto px-6 py-20">
        {coverUrl && (
          <figure className="mb-6">
            <img
              src={`https:${coverUrl}`}
              alt={coverTitle || newsArticle}
              className="w-full rounded-lg"
            />
            {coverDescription && (
              <figcaption className="mt-2 text-sm text-gray-500 italic">
                {coverDescription}
              </figcaption>
            )}
          </figure>
        )}

        <h1 className="text-4xl font-bold mb-2">{newsArticle}</h1>
        <p className="text-sm text-adinkra-gold/70 mb-6">
          {author?.fields?.name ? `By ${author.fields.name}` : "By Adinkra Media"} |{" "}
          {date ? new Date(date).toLocaleDateString() : ""} • {category}
        </p>

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
            href={`https://twitter.com/intent/tweet?url=${fullUrl}&text=${encodeURIComponent(
              newsArticle + " - " + (summaryexcerpt || "")
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-adinkra-card px-4 py-2 rounded-full text-adinkra-highlight hover:underline"
          >
            Twitter
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              newsArticle + " - " + (summaryexcerpt || "") + " " + fullUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-adinkra-card px-4 py-2 rounded-full text-adinkra-highlight hover:underline"
          >
            WhatsApp
          </a>
        </div>

        {summaryexcerpt && (
          <>
            <p className="italic text-adinkra-gold/80 mb-8">{summaryexcerpt}</p>

            <div className="max-w-3xl mx-auto my-8 px-4">
              {/* Summary excerpt ad - unique slot */}
              <AdBanner
                slot="5581679873"
                style={{ width: "100%", height: 90 }}
                keyProp="ad-summary"
              />
            </div>
          </>
        )}

        <div className="prose prose-invert prose-lg text-adinkra-gold max-w-none mb-12">
          {renderBodyWithMidAd()}
        </div>

        {affiliateLinks && (
          <div className="mt-12 bg-adinkra-card p-6 rounded-lg border border-adinkra-highlight">
            <h3 className="text-xl font-semibold mb-4 text-adinkra-highlight">
              Sponsored Products
            </h3>
            <div className="prose prose-invert prose-lg text-adinkra-gold max-w-none">
              {documentToReactComponents(affiliateLinks, options)}
            </div>
          </div>
        )}

        {mediaAssets?.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-4 text-adinkra-highlight">
              Media
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {mediaAssets.map((asset, i) => {
                const { file, title, description } = asset.fields;
                const url = `https:${file.url}`;
                const contentType = file.contentType;

                if (contentType.startsWith("image")) {
                  return (
                    <figure key={i}>
                      <img src={url} alt={title || "Media"} className="w-full rounded" />
                      {description && (
                        <figcaption className="mt-1 text-sm text-gray-500 italic">
                          {description}
                        </figcaption>
                      )}
                    </figure>
                  );
                } else if (contentType.startsWith("video")) {
                  return (
                    <video key={i} src={url} controls className="w-full rounded" />
                  );
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

        {/* Footer ad - unique slot */}
        <div className="max-w-3xl mx-auto my-8 px-4">
          <AdBanner
            slot="5581679874"
            style={{ width: "100%", height: 90 }}
            keyProp="ad-footer"
          />
        </div>

        <div className="mt-16 bg-adinkra-card p-8 rounded-lg text-center border border-adinkra-highlight shadow-lg">
          <h3 className="text-2xl font-bold text-adinkra-highlight mb-4">
            Support Our Journalism
          </h3>
          <p className="text-adinkra-gold/80 mb-6 max-w-2xl mx-auto">
            Fuel the Future of African Journalism. Support Adinkra Media — every tip helps us stay independent and amplify young African voices.
          </p>
          <a
            href="https://adinkraaudio.gumroad.com/coffee"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-adinkra-highlight text-black font-semibold py-3 px-6 rounded-full hover:bg-yellow-400 transition"
          >
            ☕ Tip Us on Gumroad
          </a>
        </div>
      </section>
      
    </div>
  );
}
