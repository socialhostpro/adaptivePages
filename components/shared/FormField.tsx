import React from 'react';

const FormField = ({ label, children, description }: { label: string, children: React.ReactNode, description?: string }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">{label}</label>
        {children}
        {description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{description}</p>}
    </div>
);

export const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        type="text"
        {...props}
        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-400"
    />
);

export const NumberInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        type="number"
        {...props}
        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-400"
    />
);

export const TextAreaInput = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        {...props}
        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-400"
    />
);

export const SelectInput = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        {...props}
        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
    />
);


export default FormField;
