
import React, { useState } from 'react';
import EyeIcon from '../icons/EyeIcon';
import EyeOffIcon from '../icons/EyeOffIcon';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput: React.FC<PasswordInputProps> = (props) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative">
            <input
                {...props}
                type={isVisible ? 'text' : 'password'}
                className="w-full p-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-400"
            />
            <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600"
                aria-label={isVisible ? 'Hide password' : 'Show password'}
            >
                {isVisible ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};

export default PasswordInput;