
import React from 'react';

const UsersGroupIcon = ({ className }: { className?: string }) => (
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
        <path d="M3 14s-1 1.44-1 2.44c0 2.43 2.89 4.31 6.44 4.56" />
        <circle cx="9" cy="8" r="4" />
        <path d="M16.5 19.5c2.42-.64 4-2.52 4-4.56 0-1-.59-1.99-1.44-2.44" />
        <path d="M14 14.5c0-2.5 2.24-4.5 5-4.5s5 2 5 4.5" />
        <path d="M1.44 16.5C3.21 14.44 5.89 13 9 13s5.79 1.44 7.56 3.5" />
    </svg>
);

export default UsersGroupIcon;
