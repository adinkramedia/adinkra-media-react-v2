import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Contentful client
const client = createClient({
  space: "8e41pkw4is56",
  accessToken: "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I",
});

// Rich text rendering options
const options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-6 leading-relaxed">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (node, children) => (
      <h1 className="text-4xl font-bold mb-6">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="text-3xl font-semibold mb-5">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-2xl font-semibold mb-4">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc list-outside mb-6 pl-5">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal list-outside mb-6 pl-5">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className="mb-2 leading-relaxed">{children}</li>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-adinkra-highlight pl-4 italic mb-6 text-adinkra-highlight">
        {children}
      </blockquote>
    ),
  },
};

export default function SacredArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    client
      .getEntry(id)
      .then(setArticle)
      .catch(console.error);
  }, [id]);

  if (!article) return <div className="text-center py-20">Loading...</div>;

  const {
    title: Title,
    author,
    excerpt,
    coverImage,
    publishedDate,
    body: bodyContent,
    wisdomTakeaway,
    reflections,
  } = article.fields;

  const coverUrl = coverImage?.fields?.file?.url;

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-20">
        {/* Cover Image */}
        {coverUrl && (
          <img
            src={`https:${coverUrl}`}
            alt={Title}
            className="w-full rounded-lg mb-6"
          />
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">{Title}</h1>

        {/* Author + Date */}
        <p className="text-sm text-adinkra-gold/70 mb-4">
          {author && <>By {author} | </>}
          {new Date(publishedDate).toLocaleDateString()}
        </p>

        {/* Excerpt */}
        {excerpt && (
          <p className="italic text-adinkra-gold/80 mb-8">{excerpt}</p>
        )}

        {/* Body Content */}
        {bodyContent && (
          <div className="prose prose-invert prose-lg text-adinkra-gold max-w-none mb-12">
            {documentToReactComponents(bodyContent, options)}
          </div>
        )}

        {/* Wisdom Takeaway */}
        {wisdomTakeaway && (
          <div className="mt-12 p-6 bg-adinkra-highlight bg-opacity-20 border-l-4 border-adinkra-highlight rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-adinkra-gold">
              Wisdom Takeaway
            </h3>
            <p className="italic text-adinkra-gold">{wisdomTakeaway}</p>
          </div>
        )}

        {/* Reflections */}
        {reflections && (
          <div className="mt-16">
            <h3 className="text-2xl font-semibold mb-4 text-adinkra-gold">
              Reflections
            </h3>
            <div className="prose prose-invert prose-lg text-adinkra-gold max-w-none">
              {documentToReactComponents(reflections, options)}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
