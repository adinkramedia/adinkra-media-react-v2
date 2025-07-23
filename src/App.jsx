import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Audio from "./pages/Audio";
import HouseOfAusar from "./pages/HouseOfAusar";
import HouseArticle from "./pages/HouseArticle";
import SacredArticle from "./pages/SacredArticle";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import Apply from "./pages/Apply";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import SubmitArticle from "./pages/SubmitArticle";
import AdinkraTV from "./pages/AdinkraTV";
import TVVideoPage from "./pages/TVVideoPage";
import PremiumTV from "./pages/PremiumTV";
import PremiumVideo from "./pages/PremiumVideo";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-adinkra-bg text-adinkra-gold">
      <Header />
      <main className="flex-grow pt-20">
        <Routes>
          {/* Core Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/audio" element={<Audio />} />
          <Route path="/house-of-ausar" element={<HouseOfAusar />} />
          <Route path="/house-article/:id" element={<HouseArticle />} />
          <Route path="/sacred-article/:id" element={<SacredArticle />} />
          <Route path="/news" element={<News />} />
          <Route path="/news-article/:id" element={<NewsArticle />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/submit-article" element={<SubmitArticle />} />

          {/* Adinkra TV Routes */}
          <Route path="/adinkra-tv" element={<AdinkraTV />} />
          <Route path="/tv" element={<Navigate to="/adinkra-tv" replace />} />
          <Route path="/tv-video/:id" element={<TVVideoPage />} />

          {/* Premium TV Routes */}
          <Route path="/premium-tv" element={<PremiumTV />} />
          <Route path="/premium-tv/:id" element={<PremiumVideo />} />
          {/* 404 Catch-All */}
          <Route
            path="*"
            element={
              <h1 className="text-center mt-20 text-adinkra-highlight text-2xl">
                404 — Page Not Found
              </h1>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
