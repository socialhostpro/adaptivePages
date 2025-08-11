import React from 'react';

const MoveIcon = ({ className }: { className?: string }) => (
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
        <path d="M8 18L12 22L16 18" />
        <path d="M8 6L12 2L16 6" />
        <path d="M18 16L22 12L18 8" />
        <path d="M6 16L2 12L6 8" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default MoveIcon;
