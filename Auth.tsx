
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import LoaderIcon from './components/icons/LoaderIcon';
import { Button, Input } from './components/shared';

const backgroundImages = [
    'https://rxkywcylrtoirshfqqpd.supabase.co/storage/v1/object/public/public//1.png', // Contractor
    'https://rxkywcylrtoirshfqqpd.supabase.co/storage/v1/object/public/public//2.png', // Doctor's Office
    'https://rxkywcylrtoirshfqqpd.supabase.co/storage/v1/object/public/public//3.png', // Lawyer
    'https://rxkywcylrtoirshfqqpd.supabase.co/storage/v1/object/public/public//4.png', // Plumber
    'https://rxkywcylrtoirshfqqpd.supabase.co/storage/v1/object/public/public//5.png', // AC Guy / HVAC
    'https://rxkywcylrtoirshfqqpd.supabase.co/storage/v1/object/public/public//6.png', // Lawn Guy / Landscaping
    'https://rxkywcylrtoirshfqqpd.supabase.co/storage/v1/object/public/public//7.png', // Tree Service
];

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Set theme on initial load for the auth page to respect user/system preference
    const savedTheme = localStorage.getItem('themeMode') as 'light' | 'dark';
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : systemIsDark;

    const root = window.document.documentElement;
    root.classList.toggle('dark', isDark);

    // Image rotation timer
    const timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, []); 


  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Email not confirmed")) {
             setError("Your email address has not been confirmed. Please check your inbox for a confirmation link.");
        } else {
             setError(error.message);
        }
      }
      // On success, the onAuthStateChange listener in App.tsx will handle navigation.
    } else { // signup
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        setError(error.message);
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        // This case handles when a user exists but is not confirmed. Supabase resends the confirmation email.
        setMessage("This email is already registered but not confirmed. We've sent you another confirmation link. Please check your email.");
      } else if (data.user) {
        setMessage('Signup successful! Please check your email for a confirmation link to complete your registration.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black">
        {/* Background Image Container */}
        <div className="fixed inset-0 z-0">
            {backgroundImages.map((url, index) => (
                <div
                    key={url}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ backgroundImage: `url(${url})` }}
                />
            ))}
        </div>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/60 z-10"></div>
        
        {/* Content */}
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 z-20">
            <div className="w-full max-w-sm md:max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">AdaptivePages</h1>
                    <p className="mt-4 text-slate-300">
                        {authMode === 'login' ? 'Sign in to continue' : 'Create an account to get started'}
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-white/10">
                    <div className="mb-6 border-b border-white/20">
                        <nav className="-mb-px flex space-x-6">
                            <button
                                onClick={() => { setAuthMode('login'); setError(null); setMessage(null); }}
                                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    authMode === 'login'
                                    ? 'border-indigo-400 text-white'
                                    : 'border-transparent text-slate-300 hover:text-white hover:border-slate-300'
                                }`}
                            >
                                Login
                            </button>
                            <button
                                 onClick={() => { setAuthMode('signup'); setError(null); setMessage(null); }}
                                 className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    authMode === 'signup'
                                    ? 'border-indigo-400 text-white'
                                    : 'border-transparent text-slate-300 hover:text-white hover:border-slate-300'
                                }`}
                            >
                                Sign Up
                            </button>
                        </nav>
                    </div>
                    <form className="space-y-6" onSubmit={handleAuth}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                            Email address
                            </label>
                            <div className="mt-1">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-slate-300/30 rounded-md shadow-sm text-base focus:ring-indigo-500 focus:border-indigo-500 transition bg-white/10 text-white placeholder-slate-400"
                            />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-2 border border-slate-300/30 rounded-md shadow-sm text-base focus:ring-indigo-500 focus:border-indigo-500 transition bg-white/10 text-white placeholder-slate-400"
                                />
                            </div>
                        </div>
                        
                        {error && <p className="text-sm text-red-400 bg-red-500/20 p-3 rounded-md">{error}</p>}
                        {message && <p className="text-sm text-green-400 bg-green-500/20 p-3 rounded-md">{message}</p>}

                        <div>
                            <Button
                                type="submit"
                                disabled={loading}
                                variant="primary"
                                size="lg"
                                className="w-full"
                            >
                                {loading ? <LoaderIcon className="h-5 w-5" /> : (authMode === 'login' ? 'Sign in' : 'Sign up')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
}
