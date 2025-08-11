
import React from 'react';

interface ColorSwatchPickerProps {
    colors: string[];
    value: string;
    onChange: (color: string) => void;
}

const ColorSwatchPicker: React.FC<ColorSwatchPickerProps> = ({ colors, value, onChange }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 p-2 border dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900/50">
            {colors.map(colorName => (
                <button
                    key={colorName}
                    type="button"
                    title={colorName}
                    onClick={() => onChange(colorName)}
                    className={`w-7 h-7 rounded-full transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-indigo-500 ${value === colorName ? 'ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-indigo-500' : ''} ${colorName === 'white' ? 'bg-white border border-slate-300' : `bg-${colorName}`}`}
                />
            ))}
             <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                placeholder="or type class"
                className="flex-grow p-1 h-7 text-xs border rounded bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-500 min-w-0"
            />
        </div>
    );
};

export default ColorSwatchPicker;
