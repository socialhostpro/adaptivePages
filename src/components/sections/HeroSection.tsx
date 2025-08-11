

import React, { useState, useEffect } from 'react';
import type { HeroSectionData, LandingPageTheme, ImageStore, CrmForm, HeroSlide, HeroButton } from '../../types';
import * as contactService from '../../services/contactService';
import RefreshIcon from '../icons/RefreshIcon';
import LoaderIcon from '../icons/LoaderIcon';
import EmbedHandler from '../shared/EmbedHandler';

interface HeroSectionProps {
  section: HeroSectionData;
  theme: LandingPageTheme;
  images: ImageStore;
  onRegenerate: (imageKey: string, prompt: string, aspectRatio?: '16:9' | '1:1') => void;
  regeneratingImages: string[];
  allForms?: CrmForm[];
  pageId?: string;
  onLinkClick?: (event: React.MouseEvent, link: string) => void;
}

const SliderBackground: React.FC<{
  slides: HeroSlide[];
  images: ImageStore;
  regeneratingImages: string[];
  onRegenerate: (imageKey: string, prompt: string, aspectRatio?: '16:9' | '1:1') => void;
  currentSlide: number;
}> = ({ slides, images, regeneratingImages, onRegenerate, currentSlide }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      {slides.map((slide, index) => {
        const imageKey = `hero_slider_${index}`;
        const isRegenerating = regeneratingImages.includes(imageKey);
        return (
          <div
            key={imageKey}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 group ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            {images[imageKey] ? (
              <img src={images[imageKey]} alt={`Slide ${index + 1}`} className="w-full h-full object-cover hero-slide-image" />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
            )}
            {isRegenerating ? (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <LoaderIcon className="w-12 h-12 text-white" />
              </div>
            ) : (
              <button
                onClick={() => onRegenerate(imageKey, slide.imagePrompt, '16:9')}
                className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                aria-label="Regenerate slide image"
              >
                <RefreshIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  );
};


const BackgroundMedia: React.FC<Pick<HeroSectionProps, 'section' | 'images' | 'onRegenerate' | 'regeneratingImages'>> = ({ section, images, onRegenerate, regeneratingImages }) => {
  if (section.backgroundType === 'video') {
    if (section.backgroundVideoEmbedCode) {
        return (
             <div className="absolute top-1/2 left-1/2 w-[120vw] h-[120vw] min-w-[200%] min-h-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none [&_iframe]:w-full [&_iframe]:h-full">
                <EmbedHandler embedCode={section.backgroundVideoEmbedCode} />
            </div>
        )
    }
    if (section.videoSource === 'vimeo' && section.vimeoVideoId) {
        return (
            <div className="absolute top-1/2 left-1/2 w-[120vw] h-[120vw] min-w-[200%] min-h-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <iframe
                    className="w-full h-full"
                    src={`https://player.vimeo.com/video/${section.vimeoVideoId}?background=1&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0`}
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }
    if ((section.videoSource === 'youtube' || !section.videoSource) && section.youtubeVideoId) {
        return (
            <div className="absolute top-1/2 left-1/2 w-[120vw] h-[120vw] min-w-[200%] min-h-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${section.youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${section.youtubeVideoId}&controls=0&showinfo=0&modestbranding=1&iv_load_policy=3&rel=0`}
                    title="Hero background video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
            </div>
        );
    }
  }

  // Default to single image
  const imageKey = 'hero';
  const isRegenerating = regeneratingImages.includes(imageKey);
  return (
    <div className="absolute inset-0 group">
      {images[imageKey] ? (
        <img src={images[imageKey]} alt="Hero background" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
      )}
      {isRegenerating ? (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center transition-opacity">
              <LoaderIcon className="w-12 h-12 text-white" />
          </div>
      ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onRegenerate(imageKey, section.imagePrompt || '', '16:9'); }}
            className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            aria-label="Regenerate hero image"
          >
            <RefreshIcon className="w-6 h-6" />
          </button>
      )}
    </div>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ section, theme, images, onRegenerate, regeneratingImages, allForms, pageId, onLinkClick }) => {
  const { primaryColorName } = theme;
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = section.slides || [];
  const useSlider = section.backgroundType === 'slider' && slides.length > 0;
  const useAnimatedText = useSlider && section.animateText === true;


  useEffect(() => {
    if (useSlider && slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 7000); // Change slide every 7 seconds for slower animation
      return () => clearInterval(timer);
    }
  }, [useSlider, slides.length]);

  const getButtonClasses = (style: HeroButton['style']) => {
    switch(style) {
        case 'secondary': return `bg-white text-slate-900 hover:bg-slate-200`;
        case 'outline': return `bg-transparent text-white border-2 border-white hover:bg-white hover:text-slate-900`;
        case 'primary':
        default: return `bg-${primaryColorName}-600 text-white hover:bg-${primaryColorName}-700`;
    }
  };
  
  const renderButtons = () => {
    const buttons = section.buttons && section.buttons.length > 0
        ? section.buttons
        : (section.ctaText ? [{ text: section.ctaText, link: section.ctaLink || '#', style: 'primary' as const }] : []);
    
    if (buttons.length === 0) return null;

    const handleClick = (e: React.MouseEvent, link: string) => {
        if (onLinkClick) {
            onLinkClick(e, link);
        } else if (link?.startsWith('#')) {
            e.preventDefault();
            document.querySelector(link)?.scrollIntoView({ behavior: 'smooth' });
        }
        // Public page navigation for 'page:' links is not yet supported in preview
    };

    return (
         <div className={`mt-10 flex flex-wrap justify-center gap-4 ${section.buttonLayout === 'vertical' ? 'flex-col sm:flex-row' : ''}`}>
            {buttons.map((btn, index) => {
                const isExternal = btn.link?.startsWith('http');
                return (
                    <a
                        key={index}
                        href={btn.link || '#'}
                        onClick={(e) => handleClick(e, btn.link)}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className={`inline-block font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg ${getButtonClasses(btn.style)}`}
                    >
                        {btn.text}
                    </a>
                )
            })}
        </div>
    );
  };
  
  const renderContent = (content: { title: string, subtitle: string }, textColorClass = 'text-white') => (
     <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${textColorClass}`}>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter drop-shadow-lg">
          {content.title}
        </h1>
        <p
            className={`mt-4 max-w-2xl mx-auto text-lg md:text-xl ${textColorClass === 'text-white' ? 'text-gray-200' : 'text-gray-600 dark:text-gray-300'} drop-shadow-md`}
            dangerouslySetInnerHTML={{ __html: content.subtitle.replace(/\n/g, '<br />') }}
        />
        {renderButtons()}
    </div>
  );

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pageId) return;

    setFormStatus('loading');
    const formData = new FormData(event.currentTarget);
    const submissionData: Record<string, string> = {};
    formData.forEach((value, key) => {
        submissionData[key] = value as string;
    });

    try {
        if (section.fields) { // It's an embedded form
            await contactService.handleEmbeddedFormSubmission(pageId, "Hero Overlay Form", submissionData);
        } else if (form) { // It's a reusable form
            await contactService.handleCustomFormSubmission(pageId, form.id, submissionData);
        } else {
            throw new Error("Form configuration is missing.");
        }
        setFormStatus('success');
        (event.target as HTMLFormElement).reset();
    } catch (error) {
        console.error("Hero form submission error:", error);
        setFormStatus('error');
    }
  };

  const form = allForms?.find(f => f.id === section.formId);
  const fieldsToRender = section.fields || form?.fields;
  const formTitle = section.formTitle || form?.name || 'Get Started Now';
  

  switch (section.layout) {
    case 'split':
      const imageKey = 'hero_split';
      const isRegenerating = regeneratingImages.includes(imageKey);
      return (
        <section className={`py-20 px-4 sm:px-6 lg:px-8 ${section.backgroundColorLight ? `bg-${section.backgroundColorLight}`: 'bg-gray-50'} ${section.backgroundColorDark ? `dark:bg-${section.backgroundColorDark}`: 'dark:bg-gray-800'}`}>
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              {renderContent({ title: section.title, subtitle: section.subtitle }, 'text-gray-900 dark:text-white')}
            </div>
            <div className="relative aspect-square group">
                {images[imageKey] ? (
                    <img src={images[imageKey]} alt={section.splitImagePrompt} className="w-full h-full object-cover rounded-2xl shadow-2xl" />
                ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded-2xl shadow-2xl"></div>
                )}
                 {isRegenerating ? (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl">
                        <LoaderIcon className="w-12 h-12 text-white" />
                    </div>
                ) : (
                    <button
                        onClick={() => onRegenerate(imageKey, section.splitImagePrompt || '', '1:1')}
                        className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        aria-label="Regenerate split hero image"
                    >
                        <RefreshIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
          </div>
        </section>
      );
    case 'split_video': {
      return (
        <section className={`py-20 px-4 sm:px-6 lg:px-8 ${section.backgroundColorLight ? `bg-${section.backgroundColorLight}`: 'bg-gray-50'} ${section.backgroundColorDark ? `dark:bg-${section.backgroundColorDark}`: 'dark:bg-gray-800'}`}>
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    {renderContent({ title: section.title, subtitle: section.subtitle }, 'text-gray-900 dark:text-white')}
                </div>
                <div className="aspect-video [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:object-cover [&_iframe]:rounded-2xl [&_iframe]:shadow-2xl">
                    {section.splitVideoEmbedCode ? (
                        <EmbedHandler embedCode={section.splitVideoEmbedCode} />
                    ) : section.splitVideoSource === 'vimeo' && section.splitVimeoVideoId ? (
                         <iframe
                            src={`https://player.vimeo.com/video/${section.splitVimeoVideoId}?title=0&byline=0&portrait=0`}
                            title="Hero split video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen>
                        </iframe>
                    ) : (
                         <iframe
                            src={`https://www.youtube.com/embed/${section.splitYoutubeVideoId}?rel=0&showinfo=0&modestbranding=1`}
                            title="Hero split video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen>
                        </iframe>
                    )}
                </div>
            </div>
        </section>
      );
    }
    case 'split_embed': {
        const embedStyles = {
            width: section.splitEmbedWidth || '100%',
            height: section.splitEmbedHeight || '450px',
        };
        return (
            <section className={`py-20 px-4 sm:px-6 lg:px-8 ${section.backgroundColorLight ? `bg-${section.backgroundColorLight}`: 'bg-gray-50'} ${section.backgroundColorDark ? `dark:bg-${section.backgroundColorDark}`: 'dark:bg-gray-800'}`}>
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-left">
                        {renderContent({ title: section.title, subtitle: section.subtitle }, 'text-gray-900 dark:text-white')}
                    </div>
                    <div className="relative [&_iframe]:rounded-2xl [&_iframe]:shadow-2xl" style={embedStyles}>
                        <EmbedHandler embedCode={section.splitEmbedCode || ''} />
                    </div>
                </div>
            </section>
        );
    }
    case 'embed_overlay': {
        const embedStyles = {
            width: section.splitEmbedWidth || '100%',
            height: section.splitEmbedHeight || '450px',
        };
        return (
            <section className="relative text-white overflow-hidden min-h-screen flex items-center justify-center py-20">
                <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                    {useSlider && slides.length > 0 ? (
                        <SliderBackground slides={slides} images={images} regeneratingImages={regeneratingImages} onRegenerate={onRegenerate} currentSlide={currentSlide} />
                    ) : (
                        <BackgroundMedia section={section} images={images} onRegenerate={onRegenerate} regeneratingImages={regeneratingImages} />
                    )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>
                
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-left">
                        {renderContent({ title: section.title, subtitle: section.subtitle })}
                    </div>
                    <div className="relative [&_iframe]:rounded-2xl [&_iframe]:shadow-2xl" style={embedStyles}>
                        <EmbedHandler embedCode={section.splitEmbedCode || ''} />
                    </div>
                </div>
            </section>
        );
    }
    case 'form_overlay':
      return (
          <section className="relative text-white overflow-hidden min-h-screen flex items-center justify-center py-20">
              {/* Background */}
              <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                  {useSlider && slides.length > 0 ? (
                      <SliderBackground slides={slides} images={images} regeneratingImages={regeneratingImages} onRegenerate={onRegenerate} currentSlide={currentSlide} />
                  ) : (
                      <BackgroundMedia section={section} images={images} onRegenerate={onRegenerate} regeneratingImages={regeneratingImages} />
                  )}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>
              
              {/* Content Grid */}
              <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                  <div className="text-center md:text-left">
                      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter drop-shadow-lg">{section.title}</h1>
                      <p className="mt-4 max-w-xl text-lg md:text-xl text-gray-200 drop-shadow-md"
                         dangerouslySetInnerHTML={{ __html: section.subtitle.replace(/\n/g, '<br />') }}/>
                      {renderButtons()}
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
                      <h3 className="text-2xl font-bold text-white text-center">{formTitle}</h3>
                      <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
                          {fieldsToRender && fieldsToRender.map(field => {
                              const commonProps = {
                                  name: field.label,
                                  id: field.id,
                                  required: field.required,
                                  placeholder: field.label,
                                  className: "w-full p-3 bg-white/20 text-white placeholder-gray-300 rounded-md border-0 focus:ring-2 focus:ring-white"
                              };
                              return (
                                  <div key={field.id}>
                                      <label htmlFor={field.id} className="sr-only">{field.label}</label>
                                      {field.type === 'textarea' ? (
                                          <textarea {...commonProps} rows={3}></textarea>
                                      ) : (
                                          <input type={field.type} {...commonProps} />
                                      )}
                                  </div>
                              )
                          })}
                          <button type="submit" disabled={formStatus === 'loading'} className={`w-full inline-block bg-${primaryColorName}-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-${primaryColorName}-700 transition-transform transform hover:scale-105 shadow-lg disabled:opacity-70`}>
                              {formStatus === 'loading' ? <LoaderIcon className="w-6 h-6 mx-auto" /> : section.buttons?.[0]?.text || 'Submit'}
                          </button>
                      </form>
                      {formStatus === 'success' && <p className="text-center text-green-300 mt-4">Thank you! We'll be in touch.</p>}
                      {formStatus === 'error' && <p className="text-center text-red-300 mt-4">Something went wrong. Please try again.</p>}
                  </div>
              </div>
          </section>
      );
    case 'background':
    default:
      return (
        <section className="relative text-white overflow-hidden h-screen min-h-[600px] flex items-center justify-center">
          {/* Background Media */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-black">
              {useSlider && slides.length > 0 ? (
                <SliderBackground 
                  slides={slides} 
                  images={images} 
                  regeneratingImages={regeneratingImages} 
                  onRegenerate={onRegenerate}
                  currentSlide={currentSlide}
                />
              ) : (
                <BackgroundMedia section={section} images={images} onRegenerate={onRegenerate} regeneratingImages={regeneratingImages} />
              )}
          </div>

          <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
          
          <div className="relative z-20 w-full">
            {useAnimatedText ? (
              slides.map((slide, index) => (
                <div key={index} className={`hero-slide-text ${index === currentSlide ? 'active' : ''}`}>
                  {renderContent(slide)}
                </div>
              ))
            ) : renderContent(section)}
          </div>
        </section>
      );
  }
};
export default HeroSection;