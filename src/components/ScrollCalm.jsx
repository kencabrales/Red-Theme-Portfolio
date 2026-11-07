import { useEffect } from "react";

// adds "is-scrolling" to <html> while the page is being scrolled
export default function ScrollCalm() {
  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;

    const onScroll = () => {
      if (!root.classList.contains("is-scrolling")) root.classList.add("is-scrolling");
      clearTimeout(timer);
      timer = setTimeout(() => root.classList.remove("is-scrolling"), 180);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      root.classList.remove("is-scrolling");
    };
  }, []);

  return null;
}
