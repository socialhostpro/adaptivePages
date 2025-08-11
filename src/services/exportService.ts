
import type { LandingPageData, ImageStore, ManagedProduct, CrmForm, HeroButton, ManagedPage } from '../types';
import { lucideIconSVGMap } from './lucideIconSVGMap';

type ExportFile = {
    content: string;
    type: 'string' | 'base64';
};

type ExportPackage = Record<string, ExportFile>;

const processImages = (images: ImageStore): { mapping: Record<string, string>, files: ExportPackage } => {
    const mapping: Record<string, string> = {};
    const files: ExportPackage = {};
    
    Object.entries(images).forEach(([key, base64Url]) => {
        if (!base64Url || !(base64Url as string).startsWith('data:image')) {
            mapping[key] = base64Url; // It might be an external URL
            return;
        }

        const match = (base64Url as string).match(/^data:image\/(\w+);base64,(.*)$/);
        if (!match) return;

        const [, extension, content] = match;
        const filename = `assets/images/${key}.${extension}`;
        mapping[key] = filename;
        files[filename] = { content, type: 'base64' };
    });

    return { mapping, files };
};


const getThemeClasses = (theme: LandingPageData['theme']) => ({
    primary: theme.primaryColorName,
    text: theme.textColorName,
});

const getIconSVG = (iconName: string, className = "w-8 h-8"): string => {
    const baseSvg = lucideIconSVGMap[iconName as keyof typeof lucideIconSVGMap] || '<svg viewBox="0 0 24 24"></svg>';
    return baseSvg.replace('<svg', `<svg class="${className}"`);
}

const resolveLink = (link: string, pageSlugMap: Map<string, string>): string => {
    if (link?.startsWith('page:')) {
        const pageId = link.substring(5);
        const slug = pageSlugMap.get(pageId);
        return slug ? `${slug}.html` : '#';
    }
    return link || '#';
};

const generateHeadHTML = (data: LandingPageData, imagePathMapping: Record<string, string>): string => {
    const { seo } = data;
    if (!seo) return '<title>My Page</title>';

    let headHtml = `
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}" />
    <meta name="keywords" content="${seo.keywords}" />
    <meta property="og:title" content="${seo.title}" />
    <meta property="og:description" content="${seo.description}" />
    `;

    if (imagePathMapping['og_image']) {
        headHtml += `<meta property="og:image" content="${imagePathMapping['og_image']}" />\n`;
    }

    if (seo.metaTags) {
        seo.metaTags.forEach(tag => {
            headHtml += `<meta name="${tag.name}" content="${tag.content}" />\n`;
        });
    }

    if (seo.schemaSnippet) {
        if (seo.schemaSnippet.trim().startsWith('<script')) {
            headHtml += `${seo.schemaSnippet}\n`;
        } else {
            headHtml += `<script type="application/ld+json">${seo.schemaSnippet}</script>\n`;
        }
    }

    if(data.headScripts) {
        headHtml += data.headScripts;
    }

    return headHtml;
};

const generateNavbarHTML = ({ nav, theme }: LandingPageData, imagePathMapping: Record<string, string>, pageSlugMap: Map<string, string>): string => {
    const { primary } = getThemeClasses(theme);
    const navClasses = nav.navStyle === 'sticky' ? 'sticky top-0' : 'relative';

    const logoHtml = nav.logoType === 'image' && imagePathMapping['logo']
        ? `<img src="${imagePathMapping['logo']}" alt="${nav.logoText || 'Logo'}" class="h-10 w-auto" style="max-width: ${nav.logoWidth || 150}px">`
        : `<span class="text-2xl font-bold text-${primary}-600 dark:text-${primary}-400">${nav.logoText}</span>`;
    
    const menuItemsHtml = (nav.menuItems || []).map(item => `
        <a href="${resolveLink(item.link, pageSlugMap)}" class="capitalize text-gray-700 dark:text-gray-300 hover:bg-${primary}-100 dark:hover:bg-slate-700 hover:text-${primary}-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">${item.text}</a>
    `).join('');

    const desktopLayouts = {
        standard: `
            <div class="flex justify-between items-center h-16">
                <div class="flex-shrink-0"><a href="#hero">${logoHtml}</a></div>
                <div class="hidden md:block"><div class="ml-10 flex items-baseline space-x-4">${menuItemsHtml}</div></div>
            </div>`,
        centered: `
            <div class="flex justify-center items-center h-16 relative">
                 <div class="absolute left-0"><a href="#hero">${logoHtml}</a></div>
                <div class="hidden md:block"><div class="flex items-baseline space-x-4">${menuItemsHtml}</div></div>
            </div>`,
        split: `
            <div class="flex justify-between items-center h-16">
                 <div class="hidden md:block"><div class="flex items-baseline space-x-1">${(nav.menuItems || []).slice(0, Math.ceil(nav.menuItems.length/2)).map(item => `<a href="${resolveLink(item.link, pageSlugMap)}" class="capitalize text-gray-700 dark:text-gray-300 hover:bg-${primary}-100 dark:hover:bg-slate-700 hover:text-${primary}-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">${item.text}</a>`).join('')}</div></div>
                 <div class="flex-shrink-0"><a href="#hero">${logoHtml}</a></div>
                 <div class="hidden md:block"><div class="flex items-baseline space-x-1">${(nav.menuItems || []).slice(Math.ceil(nav.menuItems.length/2)).map(item => `<a href="${resolveLink(item.link, pageSlugMap)}" class="capitalize text-gray-700 dark:text-gray-300 hover:bg-${primary}-100 dark:hover:bg-slate-700 hover:text-${primary}-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">${item.text}</a>`).join('')}</div></div>
            </div>`
    };

    const mobileHamburgerMenu = `
        <div id="mobile-menu" class="hidden md:hidden fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-50 flex flex-col p-4">
            <div class="flex justify-between items-center mb-8">
                ${logoHtml}
                <button id="close-mobile-menu-btn" class="p-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 text-gray-700 dark:text-gray-300"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
            </div>
            <div class="flex flex-col items-center justify-center flex-grow gap-4">
                ${(nav.menuItems || []).map(item => `<a href="${resolveLink(item.link, pageSlugMap)}" class="mobile-menu-link text-2xl font-bold text-gray-800 dark:text-gray-200 hover:text-${primary}-600 dark:hover:text-${primary}-400">${item.text}</a>`).join('')}
                ${nav.signInButtonEnabled ? `<a href="${resolveLink('modal:signin', pageSlugMap)}" class="text-2xl font-bold text-gray-800 dark:text-gray-200 hover:text-${primary}-600 dark:hover:text-${primary}-400">${nav.signInButtonText}</a>` : ''}
            </div>
        </div>
    `;

    const mobileBottomNav = `
        <div id="bottom-nav" class="hidden md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-gray-200/80 dark:border-slate-700/80 z-50">
            <div class="max-w-7xl mx-auto px-2 h-full grid grid-cols-${Math.min(5, (nav.menuItems || []).length)} items-center">
                ${(nav.menuItems || []).slice(0, 5).map(item => `
                    <a href="${resolveLink(item.link, pageSlugMap)}" class="flex flex-col items-center justify-center text-center text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400">
                        ${getIconSVG(item.iconName || 'HelpCircle', 'w-6 h-6 mb-0.5')}
                        <span class="text-[10px] font-medium truncate">${item.text}</span>
                    </a>
                `).join('')}
            </div>
        </div>
    `;

    return `
    <nav class="${navClasses} z-40 w-full backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-gray-200/80 dark:border-slate-700/80 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div class="flex justify-between items-center h-16">
                <div class="hidden md:flex flex-1 justify-between items-center">
                    ${desktopLayouts[nav.layout] || desktopLayouts.standard}
                </div>
                <div class="md:hidden flex flex-1 justify-between items-center">
                   <a href="#hero">${logoHtml}</a>
                </div>
                <div class="flex items-center gap-2">
                    ${nav.signInButtonEnabled ? `<a href="${resolveLink('modal:signin', pageSlugMap)}" class="hidden md:flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">${getIconSVG('User', 'w-4 h-4')}<span>${nav.signInButtonText}</span></a>` : ''}
                    ${nav.cartButtonEnabled ? `<a href="${resolveLink('modal:cart', pageSlugMap)}" class="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.344 1.087-.835l1.823-6.84a1.06 1.06 0 00-.44-1.222l-1.423-.853A.63.63 0 0018.53 5.5H5.25L4.817 4.077A1.06 1.06 0 003.75 3H2.25zM4.5 21a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm12.75 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" /></svg>
                        <span id="cart-count-badge" class="absolute -top-1 -right-1 hidden h-5 w-5 items-center justify-center rounded-full bg-${primary}-600 text-xs font-bold text-white">0</span>
                    </a>`: ''}
                    ${nav.mobileLayout === 'hamburger' ? `<button id="open-mobile-menu-btn" class="md:hidden p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none ml-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg></button>` : ''}
                    <button id="theme-toggle" class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"><svg id="theme-toggle-dark-icon" class="hidden h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg><svg id="theme-toggle-light-icon" class="hidden h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-3.536a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM4.95 6.364a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM15.05 6.364a1 1 0 010 1.414l.707.707a1 1 0 011.414-1.414l-.707-.707a1 1 0 01-1.414 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1z" clip-rule="evenodd"></path></svg></button>
                </div>
            </div>
        </div>
    </nav>
    ${nav.mobileLayout === 'hamburger' ? mobileHamburgerMenu : ''}
    ${nav.mobileLayout === 'bottom' ? mobileBottomNav : ''}
    `;
};

const generateHeroHTML = ({ hero, theme }: LandingPageData, imagePathMapping: Record<string, string>, pageSlugMap: Map<string, string>): string => {
    if(!hero) return '';
    const { primary, text } = getThemeClasses(theme);
    
    const getButtonClasses = (style: HeroButton['style']) => {
        switch(style) {
            case 'secondary': return `bg-white text-slate-900 hover:bg-slate-200`;
            case 'outline': return `bg-transparent text-white border-2 border-white hover:bg-white hover:text-slate-900`;
            case 'primary':
            default: return `bg-${primary}-600 text-white hover:bg-${primary}-700`;
        }
    }
    
    const buttons = (hero.buttons && hero.buttons.length > 0)
        ? hero.buttons
        : (hero.ctaText ? [{ text: hero.ctaText, link: hero.ctaLink || '#', style: 'primary' as const }] : []);

    const buttonsHTML = buttons.length > 0 ? `
        <div class="mt-10 flex flex-wrap justify-center gap-4 ${hero.buttonLayout === 'vertical' ? 'flex-col sm:flex-row' : ''}">
            ${buttons.map(btn => {
                const isExternal = btn.link?.startsWith('http');
                return `<a href="${resolveLink(btn.link, pageSlugMap)}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} class="inline-block font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg ${getButtonClasses(btn.style)}">${btn.text}</a>`
            }).join('')}
        </div>
    ` : '';

    const contentHTML = (title: string, subtitle: string, textColorClass = 'text-white') => `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${textColorClass}">
            <h1 class="text-4xl md:text-6xl font-extrabold tracking-tighter drop-shadow-lg">${title}</h1>
            <p class="mt-4 max-w-2xl mx-auto text-lg md:text-xl ${textColorClass === 'text-white' ? 'text-gray-200' : `text-${text}-600 dark:text-${text}-300`} drop-shadow-md">${subtitle.replace(/\n/g, '<br />')}</p>
            ${buttonsHTML}
        </div>
    `;
    
    const backgroundMediaHTML = () => {
        if (hero.backgroundType === 'video') {
             const videoSrc = (hero.videoSource === 'vimeo' && hero.vimeoVideoId)
                ? `https://player.vimeo.com/video/${hero.vimeoVideoId}?background=1&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0`
                : hero.backgroundVideoEmbedCode 
                ? 'about:blank' // Embed code will be handled by JS
                : (hero.videoSource === 'youtube' && hero.youtubeVideoId)
                ? `https://www.youtube.com/embed/${hero.youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${hero.youtubeVideoId}&controls=0&showinfo=0&modestbranding=1&iv_load_policy=3&rel=0`
                : '';
            
            if (hero.backgroundVideoEmbedCode) {
                 return `<div class="absolute inset-0 w-full h-full" data-embed-code="${encodeURIComponent(hero.backgroundVideoEmbedCode)}"></div>`;
            }

            return `
                <div class="absolute top-1/2 left-1/2 w-[120vw] h-[120vw] min-w-[200%] min-h-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <iframe class="w-full h-full" src="${videoSrc}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                </div>
            `;
        }
        return `<div class="absolute inset-0"><img src="${imagePathMapping['hero']}" alt="Hero background" class="w-full h-full object-cover"></div>`;
    };

    switch (hero.layout) {
        case 'split':
            return `
                <section id="hero" class="py-20 px-4 sm:px-6 lg:px-8 ${hero.backgroundColorLight ? `bg-${hero.backgroundColorLight}`: 'bg-gray-50'} ${hero.backgroundColorDark ? `dark:bg-${hero.backgroundColorDark}`: 'dark:bg-gray-800'}">
                    <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div class="text-center md:text-left">${contentHTML(hero.title, hero.subtitle, `text-${text}-900 dark:text-white`)}</div>
                        <div class="relative aspect-square"><img src="${imagePathMapping['hero_split']}" alt="${hero.splitImagePrompt}" class="w-full h-full object-cover rounded-2xl shadow-2xl"></div>
                    </div>
                </section>
            `;
        case 'background':
        default:
            return `
                <section id="hero" class="relative text-white overflow-hidden h-screen min-h-[600px] flex items-center justify-center">
                    <div class="absolute inset-0 z-0 overflow-hidden bg-black">${backgroundMediaHTML()}</div>
                    <div class="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
                    <div class="relative z-20 w-full">${contentHTML(hero.title, hero.subtitle)}</div>
                </section>
            `;
    }
};

const generateFeaturesHTML = ({ features, theme }: LandingPageData): string => {
    if (!features) return '';
    const { primary, text } = getThemeClasses(theme);
    return `
        <section id="features" class="py-20 px-4 sm:px-6 lg:px-8 bg-${text}-50 dark:bg-gray-800 section-animate">
            <div class="max-w-7xl mx-auto text-center">
                <h2 class="text-4xl font-extrabold text-${text}-900 dark:text-${text}-100">${features.title}</h2>
                <p class="mt-4 max-w-2xl mx-auto text-lg text-${text}-600 dark:text-${text}-300">${features.subtitle}</p>
                <div class="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    ${(features.items || []).map(feature => `
                        <div class="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                            <div class="inline-block text-${primary}-600 dark:text-${primary}-400 bg-${primary}-100 dark:bg-${primary}-900/50 p-4 rounded-full mb-4">
                                ${getIconSVG(feature.iconName, 'w-8 h-8')}
                            </div>
                            <h3 class="text-xl font-bold text-${text}-900 dark:text-${text}-100">${feature.name}</h3>
                            <p class="mt-2 text-base text-${text}-600 dark:text-${text}-400">${feature.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
};

const generateVideoHTML = ({ video, theme }: LandingPageData): string => {
    if (!video) return '';
    const { text } = getThemeClasses(theme);

    if (video.videoEmbedCode) {
        return `
           <section id="video" class="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 section-animate">
               <div class="max-w-4xl mx-auto text-center">
                   <h2 class="text-4xl font-extrabold text-${text}-900 dark:text-${text}-100">${video.title}</h2>
                   <p class="mt-4 max-w-2xl mx-auto text-lg text-${text}-600 dark:text-${text}-300">${video.subtitle}</p>
                   <div class="mt-12 aspect-video w-full rounded-xl shadow-2xl overflow-hidden border-4 border-gray-200 dark:border-gray-700" data-embed-code="${encodeURIComponent(video.videoEmbedCode)}">
                   </div>
               </div>
           </section>
       `;
   }

   const videoSrc = (video.videoSource === 'vimeo' && video.vimeoVideoId)
       ? `https://player.vimeo.com/video/${video.vimeoVideoId}?title=0&byline=0&portrait=0`
       : (video.videoSource === 'youtube' && video.youtubeVideoId)
       ? `https://www.youtube.com/embed/${video.youtubeVideoId}?rel=0&showinfo=0&modestbranding=1`
       : '';

    return `
        <section id="video" class="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 section-animate">
            <div class="max-w-4xl mx-auto text-center">
                <h2 class="text-4xl font-extrabold text-${text}-900 dark:text-${text}-100">${video.title}</h2>
                <p class="mt-4 max-w-2xl mx-auto text-lg text-${text}-600 dark:text-${text}-300">${video.subtitle}</p>
                <div class="mt-12 aspect-video w-full rounded-xl shadow-2xl overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                    <iframe class="w-full h-full" src="${videoSrc}" title="Video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        </section>
    `;
};

const generateTestimonialsHTML = ({ testimonials, theme }: LandingPageData, imagePathMapping: Record<string, string>): string => {
    if (!testimonials) return '';
    const { primary, text } = getThemeClasses(theme);
    return `
        <section id="testimonials" class="py-20 px-4 sm:px-6 lg:px-8 bg-${text}-50 dark:bg-gray-800 section-animate">
            <div class="max-w-7xl mx-auto text-center">
                <h2 class="text-4xl font-extrabold text-${text}-900 dark:text-${text}-100">${testimonials.title}</h2>
                <p class="mt-4 max-w-2xl mx-auto text-lg text-${text}-600 dark:text-${text}-300">${testimonials.subtitle}</p>
                <div class="mt-16 grid gap-8 lg:grid-cols-3">
                    ${(testimonials.items || []).map((testimonial, index) => `
                        <div class="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg flex flex-col items-center text-center">
                            <div class="relative w-24 h-24 rounded-full overflow-hidden mb-6 ring-4 ring-offset-4 ring-offset-white dark:ring-offset-gray-900 ring-indigo-200 dark:ring-indigo-700">
                                <img src="${imagePathMapping[`testimonial_${index}`]}" alt="${testimonial.author}" class="w-full h-full object-cover">
                            </div>
                            <blockquote class="text-lg text-${text}-700 dark:text-${text}-300 italic">"${testimonial.quote}"</blockquote>
                            <cite class="mt-6 not-italic">
                                <div class="font-bold text-lg text-${text}-900 dark:text-${text}-100">${testimonial.author}</div>
                                <div class="text-sm text-${primary}-600 dark:text-${primary}-400 font-semibold">${testimonial.role}</div>
                            </cite>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
};

const generatePricingHTML = ({ pricing, theme }: LandingPageData, pageSlugMap: Map<string, string>): string => {
    if (!pricing) return '';
    const { primary, text } = getThemeClasses(theme);
    return `
        <section id="pricing" class="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 section-animate">
            <div class="max-w-7xl mx-auto text-center">
                <h2 class="text-4xl font-extrabold text-${text}-900 dark:text-${text}-100">${pricing.title}</h2>
                <p class="mt-4 max-w-2xl mx-auto text-lg text-${text}-600 dark:text-${text}-300">${pricing.subtitle}</p>
                <div class="mt-16 grid gap-8 lg:grid-cols-3 lg:items-center">
                    ${(pricing.plans || []).map(plan => {
                        const isFeatured = plan.isFeatured;
                        return `
                        <div class="relative bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col transition-transform ${isFeatured ? `border-4 border-${primary}-500 dark:border-${primary}-400 scale-105 z-10` : 'border-2 border-gray-200 dark:border-gray-700'}">
                            ${isFeatured ? `<div class="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-${primary}-500 text-white text-sm font-semibold px-4 py-1 rounded-full">Most Popular</div>` : ''}
                            <h3 class="text-2xl font-bold text-${text}-900 dark:text-${text}-100">${plan.name}</h3>
                            <p class="mt-4 text-4xl font-extrabold text-${text}-900 dark:text-${text}-100">${plan.price}</p>
                            <ul class="mt-8 space-y-4 text-left text-${text}-600 dark:text-${text}-300 flex-grow">
                                ${(plan.features || []).map(feature => `
                                    <li class="flex items-start">
                                        <svg class="w-6 h-6 mr-2 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                                        <span>${feature}</span>
                                    </li>
                                `).join('')}
                            </ul>
                            <a href="${resolveLink(plan.ctaLink, pageSlugMap)}" class="mt-10 block w-full text-center py-3 px-6 rounded-lg font-semibold text-lg transition ${isFeatured ? `bg-${primary}-600 text-white hover:bg-${primary}-700` : `bg-${primary}-100 text-${primary}-700 hover:bg-${primary}-200 dark:bg-${primary}-900/50 dark:text-${primary}-300 dark:hover:bg-${primary}-900/80`}">
                                ${plan.ctaText}
                            </a>
                        </div>
                    `}).join('')}
                </div>
            </div>
        </section>
    `;
};


const generateFAQHTML = ({ faq, theme }: LandingPageData): string => {
    if (!faq) return '';
    const { text } = getThemeClasses(theme);
    return `
        <section id="faq" class="py-20 px-4 sm:px-6 lg:px-8 bg-${text}-50 dark:bg-gray-800 section-animate">
            <div class="max-w-3xl mx-auto text-center">
                <h2 class="text-4xl font-extrabold text-${text}-900 dark:text-${text}-100">${faq.title}</h2>
                <p class="mt-4 text-lg text-${text}-600 dark:text-${text}-300">${faq.subtitle}</p>
            </div>
            <div class="mt-12 max-w-3xl mx-auto">
                <div class="divide-y divide-gray-200 dark:divide-gray-700">
                    ${(faq.items || []).map(item => `
                        <div class="py-5">
                            <h3 class="faq-question cursor-pointer flex justify-between items-center w-full text-left">
                                <span class="font-semibold text-lg text-${text}-800 dark:text-${text}-200">${item.question}</span>
                                <span class="ml-6 flex-shrink-0">
                                    <svg class="faq-icon w-6 h-6 transform transition-transform text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </h3>
                            <div class="faq-answer mt-2 pr-12 text-${text}-600 dark:text-${text}-400" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease-in-out;">
                                <p>${item.answer}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
};

const generateCTAHTML = ({ cta, theme }: LandingPageData, pageSlugMap: Map<string, string>): string => {
    if (!cta) return '';
    const { primary } = getThemeClasses(theme);
    return `
        <section id="cta" class="bg-gradient-to-r from-${primary}-600 to-${primary}-800 dark:from-${primary}-700 dark:to-${primary}-900 section-animate">
            <div class="max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
                <h2 class="text-4xl font-extrabold text-white">${cta.title}</h2>
                <p class="mt-4 text-lg text-gray-200">${cta.subtitle}</p>
                <div class="mt-8">
                    <a href="${resolveLink(cta.ctaLink, pageSlugMap)}" class="inline-block bg-white text-${primary}-600 font-bold py-4 px-10 rounded-lg text-xl hover:bg-gray-100 transition-transform transform hover:scale-105 shadow-lg">
                        ${cta.ctaText}
                    </a>
                </div>
            </div>
        </section>
    `;
};

const generateFooterHTML = ({ footer, theme }: LandingPageData): string => {
    if (!footer) return '';
    const { text, primary } = getThemeClasses(theme);
    const socialIcons: Record<string, string> = {
        twitter: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>`,
        linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>`,
        github: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>`,
        facebook: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-3 7h-1.924c-.615 0-1.076.252-1.076.888v1.112h3l-.238 2h-2.762v8h-3v-8h-2v-2h2v-1.67c0-1.622 1.04-2.83 2.868-2.83h2.132v2z"></path></svg>`,
        instagram: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.225-.148-4.771-1.664-4.919-4.919-.058-1.265-.069-1.645-.069-4.849 0-3.204.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"></path></svg>`
    };
    return `
        <footer id="footer" class="bg-${text}-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
                <p class="text-base text-${text}-600 dark:text-${text}-400">${footer.copyrightText}</p>
                <div class="flex space-x-6 mt-4 sm:mt-0">
                    ${(footer.socialLinks || []).map(link => `
                        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="text-${text}-500 hover:text-${primary}-600 dark:hover:text-${primary}-400 transition-colors">
                           ${socialIcons[link.network] || ''}
                        </a>
                    `).join('')}
                </div>
            </div>
        </footer>
    `;
};

const generateBodyHTML = (data: LandingPageData, imagePathMapping: Record<string, string>, allProducts: ManagedProduct[], pageSlugMap: Map<string, string>): string => {
    let bodyHtml = '';
    
    const sectionGenerators: Record<string, Function> = {
        nav: generateNavbarHTML,
        hero: generateHeroHTML,
        features: generateFeaturesHTML,
        video: generateVideoHTML,
        testimonials: generateTestimonialsHTML,
        pricing: generatePricingHTML,
        faq: generateFAQHTML,
        cta: generateCTAHTML,
        footer: generateFooterHTML,
    };

    data.sectionOrder.forEach(key => {
        if (sectionGenerators[key] && data[key as keyof LandingPageData]) {
            bodyHtml += sectionGenerators[key](data, imagePathMapping, allProducts, pageSlugMap);
        } else {
             console.warn(`Export function for section "${key}" is not implemented.`);
        }
    });

    if (data.bodyScripts) {
        bodyHtml += data.bodyScripts;
    }

    return bodyHtml;
};

const generateScriptJS = (): string => `
document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        lightIcon?.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        darkIcon?.classList.remove('hidden');
    }
    themeToggleBtn?.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        darkIcon?.classList.toggle('hidden');
        lightIcon?.classList.toggle('hidden');
    });

    // Mobile Menu
    const openMenuBtn = document.getElementById('open-mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    openMenuBtn?.addEventListener('click', () => mobileMenu?.classList.remove('hidden'));
    closeMenuBtn?.addEventListener('click', () => mobileMenu?.classList.add('hidden'));
    document.querySelectorAll('.mobile-menu-link').forEach(link => {
        link.addEventListener('click', () => mobileMenu?.classList.add('hidden'));
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling;
            const icon = button.querySelector('.faq-icon');
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Scroll Animations
    const animatedSections = document.querySelectorAll('.section-animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    animatedSections.forEach(section => observer.observe(section));

    // Embed Code Loader
    document.querySelectorAll('[data-embed-code]').forEach(container => {
        const embedCode = decodeURIComponent(container.getAttribute('data-embed-code'));
        const fragment = document.createRange().createContextualFragment(embedCode);
        const scripts = Array.from(fragment.querySelectorAll('script'));
        container.appendChild(fragment);
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            for (const attr of script.attributes) {
                newScript.setAttribute(attr.name, attr.value);
            }
            if (script.innerHTML) newScript.innerHTML = script.innerHTML;
            container.appendChild(newScript);
        });
    });
});
`;

export function prepareExportPackage(
    pageData: LandingPageData, 
    images: ImageStore, 
    allProducts: ManagedProduct[],
    allPages: ManagedPage[]
): ExportPackage {
    const { mapping: imagePathMapping, files: imageFiles } = processImages(images);
    
    const pageSlugMap = new Map(allPages.map(p => [p.id, p.slug || '']));

    const headHtml = generateHeadHTML(pageData, imagePathMapping);
    const bodyHtml = generateBodyHTML(pageData, imagePathMapping, allProducts, pageSlugMap);
    const scriptJs = generateScriptJS();

    const fullHtml = `
<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${headHtml}
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${pageData.theme.fontFamily.replace(/\s/g, '+')}:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        html { scroll-behavior: smooth; }
        body { font-family: '${pageData.theme.fontFamily}', sans-serif; }
        .section-animate { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .section-animate.is-visible { opacity: 1; transform: translateY(0); }
    </style>
    <script>
        tailwind.config = { darkMode: 'class', theme: { extend: {} } }
    </script>
</head>
<body class="bg-white dark:bg-gray-900 text-${pageData.theme.textColorName}-800 dark:text-${pageData.theme.textColorName}-200">
    ${bodyHtml}
    <script>${scriptJs}</script>
</body>
</html>`;

    const exportPackage: ExportPackage = {
        'index.html': { content: fullHtml, type: 'string' },
        ...imageFiles,
    };
    
    return exportPackage;
}