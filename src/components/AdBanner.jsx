// components/AdBanner.jsx
import { useEffect } from "react";

export default function AdBanner({ slot, style = {} }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-2302585712980431" // Your AdSense publisher ID
        data-ad-slot={slot} // Ad slot from AdSense
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
