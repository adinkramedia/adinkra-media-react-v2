import { useEffect, useState } from "react";
import { createClient } from "contentful";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import AuthButton from "../components/AuthButton";  // Import AuthButton here

const SPACE_ID = "8e41pkw4is56";
const ACCESS_TOKEN = "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I";

const client = createClient({ space: SPACE_ID, accessToken: ACCESS_TOKEN });

const categories = [
  "All",
  "Politics",
  "Sports",
  "Business",
  "Technology",
  "Cultural",
  "International Affairs",
  "Science & Heritage",
  "Conflict & Humanitarian",
  "Health",
];

export default function News() {
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    client
      .getEntries({ content_type: "africanTrendingNews" })
      .then((res) => setArticles(res.items))
      .catch(console.error);
  }, []);

  const filteredArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter(
          (post) =>
            post.fields.category &&
            post.fields.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative w-full h-[70vh] bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center hidden md:block"
          style={{ backgroundImage: "url('/news-hero-desktop.jpg')" }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: "url('/news-hero-mobile.jpg')" }}
        />
        <div className="relative z-10 flex items-center justify-center h-full bg-black/50 text-center px-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-adinkra-gold mb-4">
              African Trending News
            </h1>
            <p className="text-adinkra-gold/80 max-w-2xl mx-auto text-lg">
              The latest news, reports, and analysis curated and contributed by African journalists.
            </p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 text-sm rounded-full font-medium transition ${
                selectedCategory === cat
                  ? "bg-adinkra-highlight text-adinkra-bg"
                  : "bg-adinkra-card text-adinkra-gold/70 hover:bg-adinkra-highlight/30"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((post) => {
            const { coverImage, summaryExcerpt, newsArticle, date, category } = post.fields;
            const cover = coverImage?.fields?.file?.url;
            const postDate = new Date(date).toLocaleDateString();

            return (
              <div
                key={post.sys.id}
                className="bg-adinkra-card rounded-xl border border-adinkra-highlight p-4 shadow-md"
              >
                {cover && (
                  <div
                    className="h-48 bg-cover bg-center rounded mb-4"
                    style={{ backgroundImage: `url(https:${cover})` }}
                  />
                )}
                <h3 className="text-xl font-semibold mb-1 text-adinkra-gold">{newsArticle}</h3>
                <p className="text-sm mb-1 text-adinkra-gold/60 italic">{category}</p>
                <p className="text-sm mb-2 text-adinkra-gold/70">{postDate}</p>
                <p className="text-sm mb-4 text-adinkra-gold/90">{summaryExcerpt}</p>
                <Link
                  to={`/news-article/${post.sys.id}`}
                  className="text-adinkra-highlight font-semibold hover:underline"
                >
                  Read More →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contributor CTA Section (Bottom) */}
      <section className="bg-adinkra-highlight/10 border border-adinkra-highlight rounded-lg max-w-5xl mx-auto my-16 px-6 py-10 text-center mx-4 md:mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-adinkra-highlight mb-4">
          Want to Become a Contributor?
        </h2>
        <p className="text-adinkra-gold/90 mb-6 text-sm md:text-base max-w-3xl mx-auto">
          Are you a student journalist, writer, or researcher? Apply now to gain hands-on publishing experience, build your portfolio, and contribute to African media with purpose and pride.
        </p>
        <Link
          to="/apply"
          className="inline-block bg-adinkra-highlight text-adinkra-bg px-6 py-3 rounded-full font-semibold hover:bg-adinkra-highlight/80 transition text-sm md:text-base"
        >
          Apply to Contribute →
        </Link>

        {/* Login button for contributor dashboard */}
        <div className="mt-6">
          <p className="mb-2 text-adinkra-gold/80 font-semibold text-sm">
            Already a contributor? Log in to your dashboard:
          </p>
          <AuthButton />
        </div>
      </section>

      <Footer />
    </div>
  );
}
