import React from 'react';
import XIcon from './icons/XIcon';
import AwardIcon from './icons/AwardIcon';

interface CertificateComponentProps {
    courseName: string;
    studentName: string;
    providerName: string;
    certificateTitle: string;
    onClose: () => void;
}

const CertificateComponent: React.FC<CertificateComponentProps> = ({ courseName, studentName, providerName, certificateTitle, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[102] flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl aspect-[1.414/1] rounded-lg shadow-2xl flex flex-col p-8 border-8 border-yellow-400 dark:border-yellow-600" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center text-slate-800 dark:text-slate-200 hover:scale-110 transition-transform" aria-label="Close certificate">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-800 dark:text-slate-200">
                    <AwardIcon className="w-24 h-24 text-yellow-500" />
                    <h1 className="mt-4 text-4xl font-bold">{certificateTitle}</h1>
                    <p className="mt-4 text-lg">This certificate is proudly presented to</p>
                    <p className="mt-2 text-5xl font-serif text-indigo-600 dark:text-indigo-400">{studentName}</p>
                    <p className="mt-4 text-lg">for successfully completing the course</p>
                    <h2 className="mt-2 text-3xl font-semibold">{courseName}</h2>
                    <div className="mt-12 flex justify-between w-full max-w-md border-t pt-4 border-gray-300 dark:border-slate-600">
                         <div>
                            <p className="font-bold">{providerName}</p>
                            <p className="text-sm border-t border-gray-400 dark:border-slate-500 mt-1 pt-1">Course Provider</p>
                        </div>
                        <div>
                            <p className="font-bold">{new Date().toLocaleDateString()}</p>
                            <p className="text-sm border-t border-gray-400 dark:border-slate-500 mt-1 pt-1">Date of Completion</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateComponent;