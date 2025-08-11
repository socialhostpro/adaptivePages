import React from 'react';

const TruckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 17h4" />
    <path d="M14 17.5V14H4V4h10v10" />
    <path d="M14 9h7l-4 4" />
    <path d="M4 17.5V14" />
    <circle cx="6" cy="19.5" r="2.5" />
    <circle cx="18" cy="19.5" r="2.5" />
  </svg>
);

export default TruckIcon;
