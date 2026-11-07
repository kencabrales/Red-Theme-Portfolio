import { useEffect, useRef, useState } from "react";
import "./ProfileReveal.css";

export default function ProfileReveal({ imageSrc = "/profile.jpg" }) {
  const revealRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const scrollDirectionRef = useRef("down");
  const [isVisible, setIsVisible] = useState(false);
  const [animationDirection, setAnimationDirection] = useState("down");
  const [animationRun, setAnimationRun] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const element = revealRef.current;
    if (!element) return undefined;

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    lastScrollYRef.current = window.scrollY;

    const trackScrollDirection = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollYRef.current) {
        scrollDirectionRef.current = "down";
      } else if (currentY < lastScrollYRef.current) {
        scrollDirectionRef.current = "up";
      }
      lastScrollYRef.current = currentY;
    };

    window.addEventListener("scroll", trackScrollDirection, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimationDirection(scrollDirectionRef.current);
          setAnimationRun((run) => run + 1);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", trackScrollDirection);
    };
  }, []);

  return (
    <div
      ref={revealRef}
      className={
        "profile-reveal" +
        (isVisible ? " is-visible" : "") +
        (animationDirection === "up" ? " is-reverse" : "")
      }
      aria-label="Ken Cabrales profile portrait"
    >
      {!imageFailed ? (
        <svg
          key={animationRun}
          className="mask-svg"
          viewBox="0 0 600 600"
          role="img"
          aria-label="Portrait revealed by animated diagonal capsules"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="profileCircleClip">
              <circle cx="300" cy="300" r="296" />
            </clipPath>

            <mask
              id="profilePillMask"
              x="0"
              y="0"
              width="600"
              height="600"
              maskUnits="userSpaceOnUse"
              style={{ maskType: "luminance" }}
            >
              <rect width="600" height="600" fill="black" />

              <g className="piece piece-1">
                <g transform="rotate(-45 190 210)">
                  <rect x="110" y="164" width="250" height="104" rx="52" fill="white" />
                </g>
              </g>

              <g className="piece piece-2">
                <g transform="rotate(-45 275 295)">
                  <rect x="135" y="219" width="390" height="104" rx="52" fill="white" />
                </g>
              </g>

              <g className="piece piece-3">
                <g transform="rotate(-45 395 310)">
                  <rect x="315" y="229" width="260" height="104" rx="52" fill="white" />
                </g>
              </g>

              <g className="piece piece-4">
                <g transform="rotate(-45 270 430)">
                  <rect x="240" y="354" width="140" height="104" rx="52" fill="white" />
                </g>
              </g>

              <g className="piece piece-5">
                <g transform="rotate(-45 405 420)">
                  <rect x="345" y="344" width="250" height="104" rx="52" fill="white" />
                </g>
              </g>
            </mask>
          </defs>

          <image
            href={imageSrc}
            x="0"
            y="0"
            width="600"
            height="600"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#profileCircleClip)"
            mask="url(#profilePillMask)"
            onError={() => setImageFailed(true)}
          />
        </svg>
      ) : (
        <div className="profile-reveal-fallback" role="img" aria-label="Profile image not found">
          <span>KC</span>
          <small>Add your photo at public/profile.jpg</small>
        </div>
      )}
    </div>
  );
}
