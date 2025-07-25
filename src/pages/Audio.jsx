import { useEffect, useState } from "react";
import { createClient } from "contentful";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AccordionFaq from "../components/AccordionFaq";
import WaveformPlayer from "../components/WaveformPlayer";
import { useLocation, useNavigate } from "react-router-dom";

const SPACE_ID = "8e41pkw4is56";
const ACCESS_TOKEN = "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I";

const client = createClient({ space: SPACE_ID, accessToken: ACCESS_TOKEN });

const licensingFaqs = [
  {
    question: "Can I use these tracks commercially?",
    answer:
      "Yes. Unless stated otherwise, you may use Adinkra Audio in films, podcasts, games, or educational content with credit.",
  },
  {
    question: "What license do I get when I purchase?",
    answer:
      "You receive a royalty-free license for life. You're allowed to use it in multiple projects without paying again.",
  },
  {
    question: "What am I NOT allowed to do?",
    answer:
      "You can't resell or redistribute the raw audio as-is (e.g., upload to stock platforms, remix and sell, etc.).",
  },
];

export default function Audio() {
  const [tracks, setTracks] = useState([]);
  const [likes, setLikes] = useState({});
  const [loadingLikes, setLoadingLikes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const initialPage = parseInt(query.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const itemsPerPage = 6;

  useEffect(() => {
    client
      .getEntries({ content_type: "audioTrack", order: "-sys.createdAt" })
      .then((res) => {
        setTracks(res.items);
        res.items.forEach((track) => {
          const slug = track.fields.slug || track.sys.id;
          fetchLikeCount(slug);
        });
      })
      .catch(console.error);
  }, []);

  const fetchLikeCount = async (slug) => {
    const { data, error } = await supabase
      .from("likes")
      .select("count")
      .eq("slug", slug)
      .maybeSingle();

    if (data) {
      setLikes((prev) => ({ ...prev, [slug]: data.count || 0 }));
    } else if (error && error.code !== "PGRST116") {
      console.error("Fetch error:", error);
    }
  };

  const handleLike = async (slug) => {
    setLoadingLikes((prev) => ({ ...prev, [slug]: true }));

    const { data: existing, error: fetchError } = await supabase
      .from("likes")
      .select("id, count")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing && fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch error:", fetchError);
      setLoadingLikes((prev) => ({ ...prev, [slug]: false }));
      return;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("likes")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);

      if (!updateError) {
        setLikes((prev) => ({ ...prev, [slug]: existing.count + 1 }));
      } else {
        console.error("Update error:", updateError);
      }
    } else {
      const { error: insertError } = await supabase
        .from("likes")
        .insert({ slug, type: "audio", count: 1 });

      if (!insertError) {
        setLikes((prev) => ({ ...prev, [slug]: 1 }));
      } else {
        console.error("Insert error:", insertError);
      }
    }

    setLoadingLikes((prev) => ({ ...prev, [slug]: false }));
  };

  const allCategories = ["All", ...new Set(tracks.map((t) => t.fields.category || "Audio"))];

  const filteredTracks = tracks.filter((item) => {
    const cat = item.fields.category || "Audio";
    return selectedCategory === "All" || cat === selectedCategory;
  });

  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);
  const paginatedTracks = filteredTracks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(`?page=${page}`);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    navigate(`?page=1`);
  };

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative w-full h-[80vh] bg-black">
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center hidden md:block"
          style={{ backgroundImage: "url('/audio-hero-desktop.jpg')" }}
        ></div>
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center md:hidden"
          style={{ backgroundImage: "url('/audio-hero-mobile.jpg')" }}
        ></div>
        <div className="relative z-10 h-full flex items-center justify-center text-center bg-black/40 px-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-adinkra-gold mb-4">
              Adinkra Audio
            </h1>
            <p className="text-adinkra-gold/80 text-lg max-w-2xl mx-auto">
              Buy or download royalty-free loops, soundtracks, and FX from Adinkra Media.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-6 pt-16">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                selectedCategory === cat
                  ? "bg-adinkra-highlight text-adinkra-bg"
                  : "bg-adinkra-card border border-adinkra-gold/30 text-adinkra-gold hover:bg-adinkra-highlight/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Track Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {paginatedTracks.map((item) => {
            const f = item.fields;
            const slug = f.slug || item.sys.id;
            const title = f.trackTitle;
            const price = f.freeDownload
              ? "Free Download"
              : f.priceEuro
              ? `€${f.priceEuro.toFixed(2)}`
              : "€--";
            const category = f.category || "Audio";
            const cover = f.coverImage?.fields?.file?.url;
            const preview = f.previewAudio?.fields?.file?.url;
            const download = f.fullDownloadFile?.fields?.file?.url;
            const gumroadLink = f.gumroadLink;

            return (
              <div
                key={item.sys.id}
                className="bg-adinkra-card border border-adinkra-highlight rounded-xl shadow-md p-4"
              >
                <div
                  className="w-full h-48 bg-cover bg-center rounded-md mb-4"
                  style={{ backgroundImage: `url(https:${cover})` }}
                ></div>
                <h3 className="text-xl font-semibold mb-1 text-adinkra-gold">
                  {title}
                </h3>
                <p className="text-sm mb-1 text-adinkra-gold/70">{category}</p>
                <p className="text-sm font-bold mb-3 text-adinkra-gold">{price}</p>

                <div className="mb-3">
                  <button
                    onClick={() => handleLike(slug)}
                    disabled={loadingLikes[slug]}
                    className="bg-adinkra-highlight text-black px-3 py-1 rounded-full text-sm hover:bg-yellow-400"
                  >
                    {loadingLikes[slug] ? "Liking..." : `👍 Like (${likes[slug] || 0})`}
                  </button>
                </div>

                {preview && <WaveformPlayer audioUrl={`https:${preview}`} />}

                <div className="mt-4">
                  {f.freeDownload && download ? (
                    <button
                      onClick={() => window.open(`https:${download}`, "_blank")}
                      className="bg-adinkra-highlight text-adinkra-bg font-semibold py-2 px-4 rounded hover:bg-yellow-500 transition"
                    >
                      ⬇ Free Download
                    </button>
                  ) : gumroadLink ? (
                    <button
                      onClick={() => window.open(gumroadLink, "_blank")}
                      className="bg-adinkra-highlight text-adinkra-bg font-semibold py-2 px-4 rounded hover:bg-yellow-500 transition"
                    >
                      💰 Buy on Gumroad
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center flex-wrap gap-3 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-adinkra-highlight text-adinkra-bg rounded disabled:opacity-50"
            >
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1.5 rounded ${
                  pageNum === currentPage
                    ? "bg-adinkra-highlight text-adinkra-bg font-semibold"
                    : "bg-adinkra-card text-adinkra-gold/70 hover:bg-adinkra-highlight/30"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-adinkra-highlight text-adinkra-bg rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}
      </section>

      <AccordionFaq title="Adinkra Audio Licensing FAQ" faqs={licensingFaqs} />
      
    </div>
  );
}
