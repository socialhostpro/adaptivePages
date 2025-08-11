import React from 'react';

const ComponentIcon = ({ className }: { className?: string }) => (
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
    <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3" />
    <path d="M12 5v11" />
    <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M12 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    <path d="m18 11 4 4-4 4" />
    <path d="m6 11-4 4 4 4" />
  </svg>
);

export default ComponentIcon;
