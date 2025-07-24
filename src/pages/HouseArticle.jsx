// src/pages/HouseArticle.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";

const client = createClient({
  space: "8e41pkw4is56",
  accessToken: "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I",
});

const options = {
  renderNode: {
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc list-outside mb-6 pl-5">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal list-outside mb-6 pl-5">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className="mb-2 leading-relaxed">{children}</li>
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
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-6 leading-relaxed">{children}</p>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-adinkra-highlight pl-4 italic mb-6 text-adinkra-highlight">
        {children}
      </blockquote>
    ),
  },
};

export default function HouseArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    client
      .getEntry(id)
      .then(setArticle)
      .catch(console.error);
  }, [id]);

  if (!article) return <div className="text-center py-20">Loading...</div>;

  const { title, bodyContent, coverImage, publishedDate } = article.fields;
  const coverUrl = coverImage?.fields?.file?.url;

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-20">
        {coverUrl && (
          <img
            src={`https:${coverUrl}`}
            alt={title}
            className="w-full rounded-lg mb-6"
          />
        )}
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-sm text-adinkra-gold/70 mb-8">
          {new Date(publishedDate).toLocaleDateString()}
        </p>
        <div className="prose prose-invert prose-lg text-adinkra-gold max-w-none">
          {bodyContent && documentToReactComponents(bodyContent, options)}
        </div>
      </section>
    
    </div>
  );
}
