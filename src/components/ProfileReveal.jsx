import { useState } from "react";
import "./ProfileReveal.css";

export default function ProfileReveal({ imageSrc = "/profile.jpg" }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="profile-reveal" aria-label="Ken Cabrales profile portrait">
      <div className="profile-reveal-photo">
        {!imageFailed ? (
          <img
            src={imageSrc}
            alt="Ken Cabrales"
            className="profile-reveal-image"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="profile-reveal-fallback" aria-label="Profile photo placeholder">
            <span>KC</span>
            <small>PROFILE PHOTO</small>
          </div>
        )}
      </div>

      <svg className="profile-reveal-cover" viewBox="0 0 600 600" role="presentation" aria-hidden="true">
        <defs>
          <radialGradient id="profileRevealShade" cx="46%" cy="36%" r="72%">
            <stop offset="0%" stopColor="#17050b" stopOpacity="0.98" />
            <stop offset="68%" stopColor="#210711" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#6d1028" stopOpacity="0.98" />
          </radialGradient>

          <mask id="profileRevealMask" x="0" y="0" width="600" height="600" maskUnits="userSpaceOnUse">
            <rect width="600" height="600" fill="black" />
            <circle cx="300" cy="300" r="292" fill="white" />

            <g className="profile-mask-piece profile-mask-piece-1">
              <g transform="rotate(-45 190 210)">
                <rect x="125" y="175" width="220" height="82" rx="41" fill="black" />
              </g>
            </g>
            <g className="profile-mask-piece profile-mask-piece-2">
              <g transform="rotate(-45 275 295)">
                <rect x="150" y="230" width="360" height="82" rx="41" fill="black" />
              </g>
            </g>
            <g className="profile-mask-piece profile-mask-piece-3">
              <g transform="rotate(-45 395 310)">
                <rect x="330" y="240" width="230" height="82" rx="41" fill="black" />
              </g>
            </g>
            <g className="profile-mask-piece profile-mask-piece-4">
              <g transform="rotate(-45 270 430)">
                <rect x="250" y="365" width="120" height="82" rx="41" fill="black" />
              </g>
            </g>
            <g className="profile-mask-piece profile-mask-piece-5">
              <g transform="rotate(-45 405 420)">
                <rect x="360" y="355" width="220" height="82" rx="41" fill="black" />
              </g>
            </g>
          </mask>
        </defs>

        <circle cx="300" cy="300" r="292" fill="url(#profileRevealShade)" mask="url(#profileRevealMask)" />
      </svg>

      <svg className="profile-reveal-details" viewBox="0 0 600 600" aria-hidden="true">
        <circle className="profile-reveal-inner-ring" cx="300" cy="300" r="282" />
        <ellipse
          className="profile-reveal-orbit"
          cx="300"
          cy="300"
          rx="278"
          ry="106"
          transform="rotate(-32 300 300)"
        />
        <circle className="profile-reveal-orbit-dot" cx="91" cy="398" r="6" />
        <circle className="profile-reveal-orbit-dot profile-reveal-orbit-dot-alt" cx="501" cy="190" r="5" />
        <circle className="profile-reveal-spark" cx="300" cy="13" r="3" />
      </svg>

      <div className="profile-reveal-caption">
        <span className="profile-reveal-caption-name">KEN CABRALES</span>
        <span className="profile-reveal-caption-role">DEVELOPER · DESIGNER</span>
      </div>
    </div>
  );
}
