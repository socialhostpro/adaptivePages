

import React, { useState, useEffect } from 'react';
import type { NavSectionData, LandingPageTheme } from '../types';
import LoaderIcon from './icons/LoaderIcon';
import ShoppingCartIcon from './icons/ShoppingCartIcon';
import { Menu, X } from 'lucide-react';
import DynamicIcon from './icons/DynamicIcon';
import UserIcon from './icons/UserIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';


interface NavbarProps {
    nav: NavSectionData;
    theme: LandingPageTheme;
    image?: string;
    isRegenerating?: boolean;
    cartItemCount: number;
    onCartClick: () => void;
    onSignInClick: () => void;
    onBookingClick: () => void;
    themeMode?: 'light' | 'dark';
    setThemeMode?: (mode: 'light' | 'dark') => void;
    onLinkClick?: (event: React.MouseEvent, link: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ nav, theme, image, isRegenerating, cartItemCount, onCartClick, onSignInClick, onBookingClick, themeMode, setThemeMode, onLinkClick }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const toggleTheme = () => {
        if (setThemeMode && themeMode) {
            setThemeMode(themeMode === 'light' ? 'dark' : 'light');
        }
    };
    
    useEffect(() => {
        if(mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mobileMenuOpen]);

    const handleNavClick = (e: React.MouseEvent, link: string) => {
        if (onLinkClick) {
            // Editor/Preview mode with centralized handler
            onLinkClick(e, link);
        } else if (link.startsWith('#')) {
            // Public mode fallback for anchors
            e.preventDefault();
            const id = link.substring(1);
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
        // Other link types in public mode will use default href behavior.
        
        if (mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    };


    const navClasses = nav.navStyle === 'sticky'
        ? `sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 dark:bg-slate-900/80`
        : `relative z-40 w-full bg-white dark:bg-slate-900`;

    const Logo = () => {
        if (isRegenerating) {
            return <div className="w-32 h-10 flex items-center justify-center"><LoaderIcon className="w-6 h-6" /></div>;
        }
    
        if (nav.logoType === 'image' && image) {
            return <img src={image} alt={nav.logoText || 'Logo'} className="h-10 w-auto" style={{ maxWidth: `${nav.logoWidth || 150}px` }} />;
        }
    
        if (nav.logoType === 'text') {
            return (
                <span className={`text-2xl font-bold text-${theme.primaryColorName}-600 dark:text-${theme.primaryColorName}-400`}>
                    {nav.logoText}
                </span>
            );
        }
    
        // Fallback for when an image is expected but not yet loaded
        return <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />;
    };

    const menuItemsContent = (nav.menuItems || []).map(item => {
        const isExternal = item.link?.startsWith('http');
        return (
            <a
                key={item.text}
                href={item.link}
                onClick={(e) => handleNavClick(e, item.link)}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className={`capitalize text-gray-700 dark:text-gray-300 hover:bg-${theme.primaryColorName}-100 dark:hover:bg-slate-700 hover:text-${theme.primaryColorName}-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors`}
            >
                {item.text}
            </a>
        );
    });

    const desktopNavLayouts = {
        standard: (
            <div className="flex justify-between items-center h-16">
                <div className="flex-shrink-0"><a href="#hero" onClick={(e) => handleNavClick(e, '#hero')}><Logo /></a></div>
                <div className="hidden md:block"><div className="ml-10 flex items-baseline space-x-4">{menuItemsContent}</div></div>
            </div>
        ),
        centered: (
            <div className="flex justify-center items-center h-16 relative">
                 <div className="absolute left-0"><a href="#hero" onClick={(e) => handleNavClick(e, '#hero')}><Logo /></a></div>
                <div className="hidden md:block"><div className="flex items-baseline space-x-4">{menuItemsContent}</div></div>
            </div>
        ),
        split: (
            <div className="flex justify-between items-center h-16">
                 <div className="hidden md:block"><div className="flex items-baseline space-x-1">{menuItemsContent.slice(0, Math.ceil(menuItemsContent.length/2))}</div></div>
                 <div className="flex-shrink-0"><a href="#hero" onClick={(e) => handleNavClick(e, '#hero')}><Logo /></a></div>
                 <div className="hidden md:block"><div className="flex items-baseline space-x-1">{menuItemsContent.slice(Math.ceil(menuItemsContent.length/2))}</div></div>
            </div>
        )
    };
    
    return (
        <nav className={`${navClasses} border-b border-gray-200/80 dark:border-slate-700/80 transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Desktop layout */}
                    <div className="hidden md:flex flex-1 justify-between items-center">
                        {desktopNavLayouts[nav.layout] || desktopNavLayouts.standard}
                    </div>

                    {/* Mobile layout */}
                    <div className="md:hidden flex flex-1 justify-between items-center">
                       <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')}><Logo /></a>
                    </div>

                    <div className="flex items-center gap-2">
                         {nav.signInButtonEnabled && (
                            <button onClick={(e) => handleNavClick(e, 'modal:signin')} className="hidden md:flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                <UserIcon className="w-4 h-4" />
                                {nav.signInButtonText}
                            </button>
                        )}
                        {nav.cartButtonEnabled && (
                            <button onClick={(e) => handleNavClick(e, 'modal:cart')} className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none">
                                <ShoppingCartIcon className="w-6 h-6" />
                                {cartItemCount > 0 && (
                                    <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-${theme.primaryColorName}-600 text-xs font-bold text-white`}>
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>
                        )}
                        {setThemeMode && (
                            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none">
                                {themeMode === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                            </button>
                        )}
                        {nav.mobileLayout === 'hamburger' && (
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none ml-2">
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Hamburger Menu Panel */}
            {nav.mobileLayout === 'hamburger' && mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-50 flex flex-col p-4">
                    <div className="flex justify-between items-center mb-8">
                        <Logo />
                        <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                            <X className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-grow gap-4">
                        {(nav.menuItems || []).map(item => {
                            const isExternal = item.link?.startsWith('http');
                            return (
                                <a key={item.text} href={item.link} onClick={(e) => handleNavClick(e, item.link)}
                                    target={isExternal ? '_blank' : undefined}
                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                    className={`text-2xl font-bold text-gray-800 dark:text-gray-200 hover:text-${theme.primaryColorName}-600 dark:hover:text-${theme.primaryColorName}-400`}>
                                    {item.text}
                                </a>
                            );
                        })}
                         {nav.signInButtonEnabled && (
                            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick(e, 'modal:signin'); setMobileMenuOpen(false); }}
                                className={`text-2xl font-bold text-gray-800 dark:text-gray-200 hover:text-${theme.primaryColorName}-600 dark:hover:text-${theme.primaryColorName}-400`}>
                                {nav.signInButtonText}
                            </a>
                        )}
                    </div>
                </div>
            )}
            
            {/* Bottom Nav Bar */}
            {nav.mobileLayout === 'bottom' && (
                <div className={`md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-gray-200/80 dark:border-slate-700/80 z-50`}>
                    <div className="max-w-7xl mx-auto px-2 h-full grid grid-cols-5 items-center">
                        {(nav.menuItems || []).slice(0, 5).map(item => (
                            <a key={item.text} href={item.link} onClick={(e) => handleNavClick(e, item.link)} className="flex flex-col items-center justify-center text-center text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400">
                                <DynamicIcon iconName={item.iconName || 'HelpCircle'} className="w-6 h-6 mb-0.5" />
                                <span className="text-[10px] font-medium truncate">{item.text}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;