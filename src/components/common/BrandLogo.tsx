import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  // Height sizing
  const dimensions = {
    sm: { height: 28, textScale: 'text-lg', subScale: 'text-[9px]' },
    md: { height: 38, textScale: 'text-2xl', subScale: 'text-[11px]' },
    lg: { height: 48, textScale: 'text-3xl', subScale: 'text-xs' },
    xl: { height: 60, textScale: 'text-4xl', subScale: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Crisp Envelope Vector matching the exact uploaded branding */}
      <svg
        className="shrink-0 transition-transform duration-200 hover:scale-105"
        style={{ height: `${dimensions.height}px`, width: `${dimensions.height * 1.05}px` }}
        viewBox="0 0 140 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top green back flap */}
        <polygon points="12,65 70,12 128,65" fill="#7BB83C" />
        
        {/* Letter paper document */}
        <rect x="24" y="24" width="92" height="74" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        {/* Letter lines in blue */}
        <rect x="34" y="38" width="38" height="4.5" fill="#009FE3" rx="2" />
        <rect x="34" y="48" width="72" height="3.5" fill="#009FE3" rx="1.5" />
        <rect x="34" y="56" width="62" height="3.5" fill="#009FE3" rx="1.5" />
        <rect x="34" y="64" width="46" height="3.5" fill="#009FE3" rx="1.5" />

        {/* Left red/orange envelope flap */}
        <polygon points="10,40 10,118 80,78" fill="#E84A27" />
        
        {/* Right blue envelope flap */}
        <polygon points="130,40 130,118 10,118 80,78" fill="#009FE3" />
      </svg>

      {/* Brand Text */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline">
          <span className={`font-extrabold tracking-tight text-slate-900 ${dimensions.textScale}`}>
            Inbox
          </span>
          <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 tracking-wide uppercase">
            Store
          </span>
        </div>
        {/* Underline bar */}
        <div className="w-full h-[2.5px] bg-[#E84A27] rounded-full my-0.5" />
        {showSubtitle && (
          <span className={`font-semibold tracking-normal text-slate-700 ${dimensions.subScale}`}>
            Infotech Pvt. Ltd.
          </span>
        )}
      </div>
    </div>
  );
};
