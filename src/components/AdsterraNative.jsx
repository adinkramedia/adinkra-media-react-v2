import { useEffect } from "react";

// Keep track of loaded scripts globally
const loadedScripts = {};

const AdsterraNative = ({ containerId, scriptSrc }) => {
  useEffect(() => {
    // Ensure container exists in the DOM
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className = "my-6 w-full flex justify-center";
      document.body.appendChild(container);
    }

    // Only load the script if not loaded before
    if (!loadedScripts[scriptSrc]) {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      document.body.appendChild(script);

      loadedScripts[scriptSrc] = true;
    }
  }, [containerId, scriptSrc]);

  return <div id={containerId} className="my-6 w-full flex justify-center"></div>;
};

export default AdsterraNative;
