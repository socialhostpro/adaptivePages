import React from 'react';

interface PaletteIconProps {
  className?: string;
}

const PaletteIcon: React.FC<PaletteIconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2m-6-4h6m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default PaletteIcon;
