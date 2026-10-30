import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "gold";
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  variant = "gold",
  showTagline = true,
  className = ""
}) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const titleSizes = {
    sm: "text-sm tracking-wide",
    md: "text-base tracking-wider",
    lg: "text-xl tracking-widest",
    xl: "text-2xl tracking-widest"
  };

  const taglineSizes = {
    sm: "text-[8px]",
    md: "text-[9px]",
    lg: "text-[11px]",
    xl: "text-xs"
  };

  const isLight = variant === "light";
  const isGold = variant === "gold";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Badge */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl shadow-md border ${
          isLight
            ? "bg-amber-900/10 border-amber-900/20 text-amber-950"
            : "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 border-amber-500/30 text-amber-100 shadow-amber-950/20"
        } transition-transform hover:scale-105 duration-200 shrink-0`}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-3/4 h-3/4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Coffee Cup Base */}
          <path
            d="M8 14H30C30 14 30.5 25 25 28C21 30.2 17 30.2 13 28C7.5 25 8 14 8 14Z"
            fill={isLight ? "#451a03" : "#fef3c7"}
            fillOpacity={isLight ? "0.9" : "0.95"}
          />
          {/* Saucer */}
          <path
            d="M6 31C12 33 26 33 32 31C32.5 31 33 31.8 32.5 32.2C30 34 22 35 19 35C16 35 8 34 5.5 32.2C5 31.8 5.5 31 6 31Z"
            fill={isLight ? "#78350f" : "#f59e0b"}
          />
          {/* Handle */}
          <path
            d="M30 16.5C33.5 16.5 35.5 18.5 35.5 21C35.5 23.5 33.5 25.5 30 25.5"
            stroke={isLight ? "#451a03" : "#fef3c7"}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Steam Whorls */}
          <path
            d="M13 10C13 8 15 7.5 15 5.5"
            stroke={isLight ? "#b45309" : "#fbbf24"}
            strokeWidth="1.8"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <path
            d="M19 10.5C19 8 21 7 21 4.5"
            stroke={isLight ? "#b45309" : "#fcd34d"}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M25 10C25 8 27 7.5 27 5.5"
            stroke={isLight ? "#b45309" : "#fbbf24"}
            strokeWidth="1.8"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>
        {/* Subtle Gold Sparkle Accent */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-amber-900 shadow-sm animate-ping opacity-75" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full border border-amber-900 shadow-sm" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black font-serif uppercase ${titleSizes[size]} ${
              isLight
                ? "text-stone-900"
                : isGold
                ? "bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent"
                : "text-white"
            }`}
          >
            SHRU'S CAFE
          </span>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-400 border border-amber-400/30 uppercase tracking-tighter">
            EST. 2026
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-medium tracking-wider uppercase mt-0.5 ${taglineSizes[size]} ${
              isLight ? "text-amber-800" : "text-amber-200/70"
            }`}
          >
            Artisanal Roastery & Gourmet Kitchen
          </span>
        )}
      </div>
    </div>
  );
};
