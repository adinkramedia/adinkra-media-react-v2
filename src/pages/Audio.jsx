import { useEffect, useState } from "react";
import { createClient } from "contentful";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AccordionFaq from "../components/AccordionFaq";
import WaveformPlayer from "../components/WaveformPlayer";

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
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    client
      .getEntries({ content_type: "audioTrack" })
      .then((res) => setTracks(res.items))
      .catch(console.error);
  }, []);

  const allCategories = ["All", ...new Set(tracks.map((t) => t.fields.category || "Audio"))];

  const filteredTracks = tracks.filter((item) => {
    const cat = item.fields.category || "Audio";
    return selectedCategory === "All" || cat === selectedCategory;
  });

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      {/* Hero Section */}
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

      {/* Category Filter */}
      <section className="max-w-6xl mx-auto px-6 pt-16">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
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
          {filteredTracks.map((item) => {
            const f = item.fields;
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
                <p className="text-sm mb-3 text-adinkra-gold/70">{category}</p>
                <p className="text-sm font-bold mb-3 text-adinkra-gold">
                  {price}
                </p>

                {/* Secure Audio Preview */}
                {preview && <WaveformPlayer audioUrl={`https:${preview}`} />}

                {/* Buttons */}
                <div className="mt-4">
                  {f.freeDownload ? (
                    download && (
                      <button
                        onClick={() => window.open(`https:${download}`, "_blank")}
                        className="bg-adinkra-highlight text-adinkra-bg font-semibold py-2 px-4 rounded hover:bg-yellow-500 transition"
                      >
                        ⬇ Free Download
                      </button>
                    )
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
      </section>

      {/* FAQ */}
      <AccordionFaq title="Adinkra Audio Licensing FAQ" faqs={licensingFaqs} />

      
    </div>
  );
}
