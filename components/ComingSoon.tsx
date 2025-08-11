import React from 'react';

interface ComingSoonProps {
    title: string;
    message: string;
    icon?: React.ElementType;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, message, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
        {Icon && <Icon className="w-16 h-16 mb-4 text-slate-400" />}
        <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-300">{title}</h2>
        <p className="mt-2 max-w-sm">{message}</p>
    </div>
);

export default ComingSoon;
