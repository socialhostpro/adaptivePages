import React from 'react';

interface ChevronUpIconProps {
    className?: string;
}

const ChevronUpIcon: React.FC<ChevronUpIconProps> = ({ className = "w-5 h-5" }) => {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
    );
};

export default ChevronUpIcon;
