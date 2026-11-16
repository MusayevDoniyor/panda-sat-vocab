import type { FC } from 'react';

interface FlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Authentic SVG American Flag (US)
 * Crisp vector rendering on all platforms (fixes Windows emoji text bug).
 */
export const FlagUS: FC<FlagProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-2.5',
    md: 'w-5 h-3.5',
    lg: 'w-6 h-4',
  }[size];

  return (
    <svg
      viewBox="0 0 640 480"
      className={`inline-block shrink-0 rounded-[2px] overflow-hidden align-middle shadow-2xs ring-1 ring-slate-900/10 dark:ring-white/15 ${sizeClasses} ${className}`}
      aria-label="United States Flag"
    >
      <defs>
        <g id="panda-us-star">
          <polygon
            fill="#ffffff"
            points="0,-6 1.76,-1.85 6.31,-1.85 2.62,1.11 4.03,5.71 0,2.78 -4.03,5.71 -2.62,1.11 -6.31,-1.85 -1.76,-1.85"
          />
        </g>
      </defs>
      {/* 13 stripes */}
      <rect width="640" height="480" fill="#b22234" />
      <rect y="36.9" width="640" height="36.9" fill="#ffffff" />
      <rect y="110.8" width="640" height="36.9" fill="#ffffff" />
      <rect y="184.6" width="640" height="36.9" fill="#ffffff" />
      <rect y="258.5" width="640" height="36.9" fill="#ffffff" />
      <rect y="332.3" width="640" height="36.9" fill="#ffffff" />
      <rect y="406.2" width="640" height="36.9" fill="#ffffff" />
      {/* Canton */}
      <rect width="256" height="258.5" fill="#3c3b6e" />
      {/* Stars Grid */}
      <g>
        {/* Row 1: 6 stars */}
        <use href="#panda-us-star" x="21" y="21" />
        <use href="#panda-us-star" x="64" y="21" />
        <use href="#panda-us-star" x="106" y="21" />
        <use href="#panda-us-star" x="149" y="21" />
        <use href="#panda-us-star" x="192" y="21" />
        <use href="#panda-us-star" x="235" y="21" />
        {/* Row 2: 5 stars */}
        <use href="#panda-us-star" x="42" y="47" />
        <use href="#panda-us-star" x="85" y="47" />
        <use href="#panda-us-star" x="128" y="47" />
        <use href="#panda-us-star" x="171" y="47" />
        <use href="#panda-us-star" x="213" y="47" />
        {/* Row 3: 6 stars */}
        <use href="#panda-us-star" x="21" y="73" />
        <use href="#panda-us-star" x="64" y="73" />
        <use href="#panda-us-star" x="106" y="73" />
        <use href="#panda-us-star" x="149" y="73" />
        <use href="#panda-us-star" x="192" y="73" />
        <use href="#panda-us-star" x="235" y="73" />
        {/* Row 4: 5 stars */}
        <use href="#panda-us-star" x="42" y="99" />
        <use href="#panda-us-star" x="85" y="99" />
        <use href="#panda-us-star" x="128" y="99" />
        <use href="#panda-us-star" x="171" y="99" />
        <use href="#panda-us-star" x="213" y="99" />
        {/* Row 5: 6 stars */}
        <use href="#panda-us-star" x="21" y="125" />
        <use href="#panda-us-star" x="64" y="125" />
        <use href="#panda-us-star" x="106" y="125" />
        <use href="#panda-us-star" x="149" y="125" />
        <use href="#panda-us-star" x="192" y="125" />
        <use href="#panda-us-star" x="235" y="125" />
        {/* Row 6: 5 stars */}
        <use href="#panda-us-star" x="42" y="151" />
        <use href="#panda-us-star" x="85" y="151" />
        <use href="#panda-us-star" x="128" y="151" />
        <use href="#panda-us-star" x="171" y="151" />
        <use href="#panda-us-star" x="213" y="151" />
        {/* Row 7: 6 stars */}
        <use href="#panda-us-star" x="21" y="177" />
        <use href="#panda-us-star" x="64" y="177" />
        <use href="#panda-us-star" x="106" y="177" />
        <use href="#panda-us-star" x="149" y="177" />
        <use href="#panda-us-star" x="192" y="177" />
        <use href="#panda-us-star" x="235" y="177" />
        {/* Row 8: 5 stars */}
        <use href="#panda-us-star" x="42" y="203" />
        <use href="#panda-us-star" x="85" y="203" />
        <use href="#panda-us-star" x="128" y="203" />
        <use href="#panda-us-star" x="171" y="203" />
        <use href="#panda-us-star" x="213" y="203" />
        {/* Row 9: 6 stars */}
        <use href="#panda-us-star" x="21" y="229" />
        <use href="#panda-us-star" x="64" y="229" />
        <use href="#panda-us-star" x="106" y="229" />
        <use href="#panda-us-star" x="149" y="229" />
        <use href="#panda-us-star" x="192" y="229" />
        <use href="#panda-us-star" x="235" y="229" />
      </g>
    </svg>
  );
};

/**
 * Authentic SVG Uzbekistan Flag (UZ)
 * Crisp vector rendering on all platforms (fixes Windows emoji text bug).
 */
export const FlagUZ: FC<FlagProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-2.5',
    md: 'w-5 h-3.5',
    lg: 'w-6 h-4',
  }[size];

  return (
    <svg
      viewBox="0 0 640 320"
      className={`inline-block shrink-0 rounded-[2px] overflow-hidden align-middle shadow-2xs ring-1 ring-slate-900/10 dark:ring-white/15 ${sizeClasses} ${className}`}
      aria-label="Uzbekistan Flag"
    >
      <defs>
        <g id="panda-uz-star">
          <polygon
            fill="#ffffff"
            points="0,-4.5 1.32,-1.39 4.73,-1.39 1.97,0.83 3.02,4.28 0,2.08 -3.02,4.28 -1.97,0.83 -4.73,-1.39 -1.32,-1.39"
          />
        </g>
      </defs>
      {/* 3 main stripes */}
      <rect width="640" height="102" fill="#0099b5" />
      <rect y="102" width="640" height="6" fill="#ce1126" />
      <rect y="108" width="640" height="104" fill="#ffffff" />
      <rect y="212" width="640" height="6" fill="#ce1126" />
      <rect y="218" width="640" height="102" fill="#1eb53a" />
      {/* Crescent in blue stripe */}
      <circle cx="70" cy="51" r="30" fill="#ffffff" />
      <circle cx="78" cy="51" r="24" fill="#0099b5" />
      {/* 12 Stars: 3 in row 1, 4 in row 2, 5 in row 3 */}
      {/* Row 1 (top): 3 stars */}
      <use href="#panda-uz-star" x="146" y="25" />
      <use href="#panda-uz-star" x="168" y="25" />
      <use href="#panda-uz-star" x="190" y="25" />
      {/* Row 2 (middle): 4 stars */}
      <use href="#panda-uz-star" x="124" y="51" />
      <use href="#panda-uz-star" x="146" y="51" />
      <use href="#panda-uz-star" x="168" y="51" />
      <use href="#panda-uz-star" x="190" y="51" />
      {/* Row 3 (bottom): 5 stars */}
      <use href="#panda-uz-star" x="102" y="77" />
      <use href="#panda-uz-star" x="124" y="77" />
      <use href="#panda-uz-star" x="146" y="77" />
      <use href="#panda-uz-star" x="168" y="77" />
      <use href="#panda-uz-star" x="190" y="77" />
    </svg>
  );
};
