import React, { useState, useEffect } from 'react';
import FormField, { SelectInput, TextInput } from './FormField';
import { SECTIONS } from '../../constants';

interface LinkEditorProps {
    value: string;
    onChange: (newValue: string) => void;
    allPages: { id: string, name: string }[];
    allSections: string[];
}

const LinkEditor: React.FC<LinkEditorProps> = ({ value, onChange, allPages, allSections }) => {
    const [type, setType] = useState<'anchor' | 'page' | 'external'>('anchor');
    const [href, setHref] = useState('');

    useEffect(() => {
        if (value?.startsWith('#')) {
            setType('anchor');
            setHref(value);
        } else if (value?.startsWith('page:')) {
            setType('page');
            setHref(value.substring(5));
        } else if (value?.startsWith('http')) {
            setType('external');
            setHref(value);
        } else {
            // Default for empty or unrecognized, or modal links
            if(value?.startsWith('modal:')) {
                // We don't have an editor for modal links yet, treat as external for now
                setType('external');
                setHref(value);
            } else {
                setType('anchor');
                setHref(value || '#');
            }
        }
    }, [value]);

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as 'anchor' | 'page' | 'external';
        setType(newType);
        // Reset value when type changes to a sensible default
        if (newType === 'anchor') onChange('#' + (allSections[0] || ''));
        else if (newType === 'page' && allPages.length > 0) onChange('page:' + allPages[0].id);
        else if (newType === 'external') onChange('https://');
        else onChange(''); // Fallback for empty selections
    };

    const handleHrefChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const newHref = e.target.value;
        setHref(newHref);
        if (type === 'anchor') {
            onChange(newHref);
        } else if (type === 'page') {
            onChange(`page:${newHref}`);
        } else if (type === 'external') {
            onChange(newHref);
        }
    };
    
    return (
        <div className="flex items-end gap-2">
            <div className="w-1/3">
                <FormField label="Link Type">
                    <SelectInput value={type} onChange={handleTypeChange}>
                        <option value="anchor">Anchor to Section</option>
                        <option value="page">Another Page</option>
                        <option value="external">External URL</option>
                    </SelectInput>
                </FormField>
            </div>
            <div className="flex-grow">
                {type === 'anchor' && (
                    <FormField label="Section">
                        <SelectInput value={href} onChange={handleHrefChange}>
                            {allSections.map(s => <option key={s} value={`#${s}`}>{SECTIONS[s as keyof typeof SECTIONS] || s}</option>)}
                        </SelectInput>
                    </FormField>
                )}
                {type === 'page' && (
                     <FormField label="Page">
                        <SelectInput value={href} onChange={handleHrefChange}>
                             {allPages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </SelectInput>
                    </FormField>
                )}
                {type === 'external' && (
                     <FormField label="URL">
                        <TextInput value={href} onChange={handleHrefChange} placeholder="https://example.com" />
                    </FormField>
                )}
            </div>
        </div>
    );
};

export default LinkEditor;
