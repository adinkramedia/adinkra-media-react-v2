import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AnalyticsTracker from "./components/AnalyticsTracker";

// Pages
import Home from "./pages/Home";
import Audio from "./pages/Audio";
import HouseOfAusar from "./pages/HouseOfAusar";
import HouseArticle from "./pages/HouseArticle";
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
import Contact from "./pages/Contact";
import ShareDashboard from "./pages/ShareDashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-adinkra-bg text-adinkra-gold">
      <AnalyticsTracker />
      <Header />
      <main className="flex-grow pt-20">
        <Routes>
          {/* Core Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/audio" element={<Audio />} />
          <Route path="/house-of-ausar" element={<HouseOfAusar />} />
          <Route path="/news" element={<News />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/submit-article" element={<SubmitArticle />} />
          <Route path="/contact" element={<Contact />} />

          {/* Public Contributor Profile */}
          <Route path="/contributor/:id" element={<ShareDashboard />} />

          {/* Article Pages (standard + clean share URLs) */}
          <Route path="/house-article/:id" element={<HouseArticle />} />
          <Route path="/house/:id" element={<HouseArticle />} />

          <Route path="/news-article/:id" element={<NewsArticle />} />
          <Route path="/news/:id" element={<NewsArticle />} />

          {/* Adinkra TV */}
          <Route path="/adinkra-tv" element={<AdinkraTV />} />
          <Route path="/tv" element={<Navigate to="/adinkra-tv" replace />} />
          <Route path="/tv-video/:id" element={<TVVideoPage />} />

          {/* Premium TV */}
          <Route path="/premium-tv" element={<PremiumTV />} />
          <Route path="/premium-tv/:id" element={<PremiumVideo />} />

          {/* Catch-All */}
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
