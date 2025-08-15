import { useEffect, useRef, useState } from "react";

export default function AdsterraAd() {
  const adRef = useRef(null);
  const [adConfig, setAdConfig] = useState({
    keyId: "",
    format: "iframe",
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Detect screen size for responsive ads
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      setAdConfig({
        keyId: "f58bb7dacd9d77f1bcea231e9e2052b5", // Mobile key
        format: "iframe",
        width: 320,
        height: 50,
      });
    } else {
      setAdConfig({
        keyId: "825faa72504bd8a6ee1bac5b8cd098af", // Desktop key
        format: "iframe",
        width: 728,
        height: 90,
      });
    }
  }, []);

  useEffect(() => {
    if (!adRef.current || !adConfig.keyId) return;

    // 1️⃣ Create the atOptions config script
    const configScript = document.createElement("script");
    configScript.type = "text/javascript";
    configScript.innerHTML = `
      atOptions = {
        'key' : '${adConfig.keyId}',
        'format' : '${adConfig.format}',
        'height' : ${adConfig.height},
        'width' : ${adConfig.width},
        'params' : {}
      };
    `;

    // 2️⃣ Create the Adsterra invoke script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `//www.highperformanceformat.com/${adConfig.keyId}/invoke.js`;

    // 3️⃣ Append both scripts into the ad container
    adRef.current.innerHTML = "";
    adRef.current.appendChild(configScript);
    adRef.current.appendChild(invokeScript);

    return () => {
      adRef.current.innerHTML = "";
    };
  }, [adConfig]);

  return (
    <div
      ref={adRef}
      style={{
        textAlign: "center",
        margin: "20px auto",
        display: "block",
      }}
    />
  );
}
