import React from "react";

const Logo = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 240 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Room Booking"
    >
      <defs>
        <linearGradient id="rbLogoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* roof */}
      <path
        d="M5 31 L36 7 L67 31"
        stroke="#f59e0b"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* building body */}
      <rect x="11" y="18" width="50" height="46" rx="10" fill="url(#rbLogoGrad)" />
      {/* door */}
      <rect x="25" y="38" width="22" height="26" rx="5" fill="#ffffff" fillOpacity="0.95" />
      {/* windows */}
      <circle cx="19" cy="30" r="3.5" fill="#ffffff" fillOpacity="0.95" />
      <circle cx="53" cy="30" r="3.5" fill="#ffffff" fillOpacity="0.95" />

      {/* wordmark */}
      <text
        x="76"
        y="50"
        fontFamily="inherit"
        fontSize="30"
        fill="currentColor"
        textLength="152"
        lengthAdjust="spacingAndGlyphs"
      >
        <tspan fontWeight="800">Room</tspan>
        <tspan fontWeight="300" opacity="0.8">
          Booking
        </tspan>
      </text>
    </svg>
  );
};

export default Logo;
