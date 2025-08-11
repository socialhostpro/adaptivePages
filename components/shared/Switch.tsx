import React from 'react';

interface SwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}
        onClick={() => onChange(!enabled)}
    >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

export default Switch;