
import React from 'react';

const FileJsonIcon = ({ className }: { className?: string }) => (
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
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <path d="M10 12.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5" />
        <path d="M14 12.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5" />
        <path d="M10 15.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5Z" />
    </svg>
);

export default FileJsonIcon;