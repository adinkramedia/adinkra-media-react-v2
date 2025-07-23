import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SPACE_ID = "8e41pkw4is56";
const ACCESS_TOKEN = "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I";

const endpoints = [
  {
    id: "africanTrendingNews",
    title: "Trending News",
    path: "/news",
    titleField: "News Article",
    summaryField: "Summary/Excerpt",
    imageField: "coverImage",
    dateField: "date",
  },
  {
    id: "sacredAndSovereign",
    title: "Sacred & Sovereign",
    path: "/house-of-ausar",
    titleField: "Title",
    summaryField: "excerpt",
    imageField: "coverImage",
    dateField: "publishedDate",
  },
  {
    id: "audioTrack",
    title: "Adinkra Audio",
    path: "/audio",
    titleField: "Track Title",
    summaryField: "category",
    imageField: "coverImage",
    dateField: null,
  },
];

export default function FeaturedSections() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const all = await Promise.all(
        endpoints.map(async ({ id, titleField, summaryField, imageField, title, path, dateField }) => {
          try {
            const orderParam = dateField ? `&order=-fields.${dateField}` : "";
            const res = await fetch(
              `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master/entries?access_token=${ACCESS_TOKEN}&content_type=${id}${orderParam}&limit=1&include=1`
            );
            const data = await res.json();
            const item = data.items?.[0];
            if (!item) return null;

            const assets = new Map(
              data.includes?.Asset?.map((a) => [a.sys.id, a]) || []
            );
            const imageId = item.fields?.[imageField]?.sys?.id;
            const image = assets.get(imageId)?.fields?.file?.url;

            return {
              id,
              path,
              title: item.fields?.[titleField] || title,
              summary: item.fields?.[summaryField] || "",
              image: image ? `https:${image}` : null,
            };
          } catch (err) {
            console.error(`Error fetching ${id}:`, err);
            return null;
          }
        })
      );

      setContent(all.filter(Boolean));
      setLoading(false);
    };

    fetchContent();
  }, []);

  return (
    <section className="bg-adinkra-bg py-20 px-4">
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-adinkra-gold text-center">
          Explore Adinkra
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-adinkra-card rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="bg-adinkra-bg/40 h-48 w-full"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-adinkra-gold/30 w-3/4 rounded"></div>
                    <div className="h-3 bg-adinkra-gold/20 w-full rounded"></div>
                    <div className="h-3 bg-adinkra-gold/10 w-5/6 rounded"></div>
                    <div className="h-8 bg-adinkra-highlight/30 w-24 mt-4 rounded"></div>
                  </div>
                </div>
              ))
            : content.map((section) => (
                <div
                  key={section.id}
                  className="bg-adinkra-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 hover:-translate-y-1 group"
                >
                  <Link to={section.path}>
                    {section.image && (
                      <div className="overflow-hidden h-48">
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                  </Link>
                  <div className="p-5 flex flex-col justify-between h-[220px]">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-adinkra-gold group-hover:text-adinkra-highlight transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-sm text-adinkra-gold/80 leading-snug line-clamp-3">
                        {section.summary || "Explore the latest news from Adinkra."}
                      </p>
                    </div>
                    <Link
                      to={section.path}
                      className="mt-4 text-sm bg-adinkra-highlight text-adinkra-bg font-semibold py-1.5 px-4 rounded hover:bg-yellow-500 transition-all text-center inline-block w-max"
                    >
                      Explore →
                    </Link>
                  </div>
                </div>
              ))}

          {/* Adinkra TV Placeholder */}
          <div className="bg-adinkra-card rounded-xl overflow-hidden shadow-lg p-6 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4 text-adinkra-highlight">📺</div>
            <h3 className="text-lg font-semibold text-adinkra-gold mb-2">Adinkra TV</h3>
            <p className="text-sm text-adinkra-gold/80 mb-4">
              Coming soon: Watch documentaries, interviews & exclusive Adinkra originals.
            </p>
            <button className="text-sm bg-adinkra-highlight text-adinkra-bg font-semibold py-1.5 px-4 rounded hover:bg-yellow-500 transition-all">
              Stay Tuned
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
