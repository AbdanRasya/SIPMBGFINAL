import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { BLUE } from "@/app/data/constants";

/** Floating back-to-top button that appears after scrolling down */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background: BLUE,
        boxShadow: `0 4px 14px ${BLUE}50`,
        animation: "fadeInUp 0.3s ease",
      }}
      aria-label="Kembali ke atas"
    >
      <ArrowUp size={20} />
    </button>
  );
}
