import "./ProfileReveal.css";

export default function ProfileReveal({ imageSrc = "/profile.jpg" }) {
  return (
    <div className="profile-reveal" aria-label="Ken Cabrales profile portrait">
      <svg
        className="mask-svg"
        viewBox="0 0 600 600"
        role="img"
        aria-label="Ken Cabrales portrait revealed by animated diagonal capsules"
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
                <rect x="125" y="175" width="220" height="82" rx="41" fill="white" />
              </g>
            </g>

            <g className="piece piece-2">
              <g transform="rotate(-45 275 295)">
                <rect x="150" y="230" width="360" height="82" rx="41" fill="white" />
              </g>
            </g>

            <g className="piece piece-3">
              <g transform="rotate(-45 395 310)">
                <rect x="330" y="240" width="230" height="82" rx="41" fill="white" />
              </g>
            </g>

            <g className="piece piece-4">
              <g transform="rotate(-45 270 430)">
                <rect x="250" y="365" width="120" height="82" rx="41" fill="white" />
              </g>
            </g>

            <g className="piece piece-5">
              <g transform="rotate(-45 405 420)">
                <rect x="360" y="355" width="220" height="82" rx="41" fill="white" />
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
        />
      </svg>
    </div>
  );
}
