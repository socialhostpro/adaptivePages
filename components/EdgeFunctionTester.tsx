
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { supabaseUrl, supabaseAnonKey } from '../supabaseCredentials';
import LoaderIcon from './icons/LoaderIcon';

const EdgeFunctionTester: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFunction, setSelectedFunction] = useState<string>('confirm-booking');
    const [params, setParams] = useState<Record<string, string>>({});


    const availableFunctions = [
        { 
            key: 'confirm-booking', 
            label: 'Confirm Booking (POST)', 
            method: 'POST', 
            params: [{ name: 'bookingId', type: 'text', placeholder: 'Enter booking_id (UUID)' }] 
        },
    ];

    const handleTest = async () => {
        setIsLoading(true);
        setResponse(null);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Authentication error. Please log in again.");
            }

            const funcData = availableFunctions.find(f => f.key === selectedFunction);
            if (!funcData) {
                throw new Error("Selected function not found.");
            }

            const url = `${supabaseUrl}/functions/v1/${funcData.key}`;
            const options: RequestInit = {
                method: funcData.method,
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': supabaseAnonKey,
                    'Content-Type': 'application/json'
                }
            };
            
            if (funcData.method === 'POST' && funcData.params) {
                options.body = JSON.stringify(params);
            }

            const fetchResponse = await fetch(url, options);
            const responseData = await fetchResponse.json();

            if (!fetchResponse.ok) {
                // Try to parse error message from Supabase Functions response
                const errorMessage = responseData.error || responseData.message || JSON.stringify(responseData);
                throw new Error(`Function returned status ${fetchResponse.status}: ${errorMessage}`);
            }

            setResponse(responseData);

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const currentFunc = availableFunctions.find(f => f.key === selectedFunction);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md h-full flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Edge Function Tester</h2>
            
            <div className="flex items-center gap-4 mb-4">
                <select
                    value={selectedFunction}
                    onChange={e => {
                        setSelectedFunction(e.target.value);
                        setParams({});
                    }}
                    className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700"
                >
                    {availableFunctions.map(func => (
                        <option key={func.key} value={func.key}>{func.label}</option>
                    ))}
                </select>
                <button
                    onClick={handleTest}
                    disabled={isLoading}
                    className="py-2 px-6 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center w-32"
                >
                    {isLoading ? <LoaderIcon className="w-5 h-5" /> : 'Run Test'}
                </button>
            </div>
            
             {currentFunc?.params && (
                <div className="mb-4 space-y-2 p-4 border rounded-lg dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Parameters</h3>
                    {currentFunc.params.map(param => (
                        <div key={param.name}>
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">{param.name}</label>
                            <input
                                type={param.type}
                                placeholder={param.placeholder}
                                value={params[param.name] || ''}
                                onChange={e => setParams(prev => ({ ...prev, [param.name]: e.target.value }))}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700"
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="flex-grow bg-slate-100 dark:bg-slate-900 rounded-lg p-4 overflow-auto">
                <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Response</h3>
                <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all">
                    <code>
                        {isLoading && 'Testing...'}
                        {error && <span className="text-red-500 dark:text-red-400">{error}</span>}
                        {response && JSON.stringify(response, null, 2)}
                        {!isLoading && !error && !response && 'Click "Run Test" to see the function output.'}
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default EdgeFunctionTester;