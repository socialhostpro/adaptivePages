
import React from 'react';

const SparklesIcon = ({ className }: { className?: string }) => (
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
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6-10.375A1 1 0 0 1 3.437 2.5l10.375 6a2 2 0 0 0 1.437 1.437l6 10.375a1 1 0 0 1-1.187 1.187l-10.375-6Z" />
    <path d="M2.5 3.437 8.5 14.063" />
    <path d="M14 21.5 19 12" />
    <path d="M12 4.5 17 9" />
    <path d="m14 14-.5 3" />
    <path d="M20 16.5 22 14" />
  </svg>
);

export default SparklesIcon;
