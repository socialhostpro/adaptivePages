import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as icons from 'lucide-react';
import { Search } from 'lucide-react';

interface IconPickerProps {
    onSelect: (iconName: string) => void;
    onClose: () => void;
}

const iconNames = Object.keys(icons).filter(key => typeof icons[key as keyof typeof icons] === 'object');

const IconPicker: React.FC<IconPickerProps> = ({ onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const pickerRef = useRef<HTMLDivElement>(null);

    const filteredIcons = useMemo(() => {
        if (!search) return iconNames;
        return iconNames.filter(name => name.toLowerCase().includes(search.toLowerCase()));
    }, [search]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div 
            ref={pickerRef}
            className="absolute top-full mt-2 z-50 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-2xl ring-1 ring-black/5 flex flex-col"
        >
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search icons..."
                        className="w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
            </div>
            <div className="p-2 overflow-y-auto max-h-60 grid grid-cols-6 gap-1">
                {filteredIcons.map(iconName => {
                    const IconComponent = icons[iconName as keyof typeof icons] as React.ElementType;
                    return (
                        <button
                            key={iconName}
                            onClick={() => onSelect(iconName)}
                            title={iconName}
                            className="flex items-center justify-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                            <IconComponent className="w-5 h-5" />
                        </button>
                    )
                })}
                 {filteredIcons.length === 0 && <p className="col-span-6 text-center text-sm text-slate-500 py-4">No icons found</p>}
            </div>
        </div>
    );
};

export default IconPicker;