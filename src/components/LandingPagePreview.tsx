
import React, { useRef, useEffect } from 'react';
import type { LandingPageData, ImageStore, ManagedProduct, CartItem, CourseSectionData, CourseChapter, CrmForm } from '../types';
import Navbar from './Navbar';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import TestimonialsSection from './sections/TestimonialsSection';
import PricingSection from './sections/PricingSection';
import FAQSection from './sections/FAQSection';
import CTASection from './sections/CTASection';
import VideoSection from './sections/VideoSection';
import ContactSection from './sections/ContactSection';
import BookingSection from './sections/BookingSection';
import WhyChooseUsSection from './sections/WhyChooseUsSection';
import GallerySection from './sections/GallerySection';
import ProductsSection from './sections/ProductsSection';
import CourseSection from './sections/CourseSection';
import CustomFormSection from './sections/CustomFormSection';
import EmbedSection from './sections/EmbedSection';
import FooterSection from './sections/FooterSection';
import SparklesIcon from './icons/SparklesIcon';
import LoaderIcon from './icons/LoaderIcon';
import EditIcon from './icons/EditIcon';

interface LandingPagePreviewProps {
  pageId?: string;
  data: LandingPageData | null;
  images: ImageStore;
  allProducts: ManagedProduct[];
  loading: false | string;
  error: string | null;
  onEditSection?: (sectionKey: string) => void; // Made optional
  onLinkClick?: (event: React.MouseEvent, link: string) => void;
  onRegenerateImage: (imageKey: string, prompt: string, aspectRatio?: '16:9' | '1:1') => void;
  regeneratingImages: string[];
  onAddToCart: (product: ManagedProduct, selectedOptions: Record<string, string>) => void;
  cartItems: CartItem[];
  setIsCartOpen: (isOpen: boolean) => void;
  onSignInClick: () => void;
  onOpenBookingModal?: () => void;
  // Course props
  courseAccess: boolean;
  onEnroll: (course: CourseSectionData) => void;
  courseProgress: Record<string, 'completed'>;
  onStartLesson: (lessonIndex: number) => void;
  onTakeQuiz: (chapter: CourseChapter) => void;
  themeMode?: 'light' | 'dark';
  setThemeMode?: (mode: 'light' | 'dark') => void;
  customForms?: CrmForm[];
}

const SkeletonPiece = ({ className }: { className?: string }) => (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
);

const LoadingState = ({ message }: { message: string }) => (
    <div className="w-full h-screen flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-900">
        <LoaderIcon className="w-12 h-12 text-indigo-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Generating Your Page...</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{message}</p>
        <div className="w-full max-w-4xl mt-12 space-y-8">
            <SkeletonPiece className="h-48 w-full" />
            <div className="flex space-x-8">
                <SkeletonPiece className="h-32 w-1/3" />
                <SkeletonPiece className="h-32 w-1/3" />
                <SkeletonPiece className="h-32 w-1/3" />
            </div>
            <SkeletonPiece className="h-24 w-full" />
        </div>
    </div>
);

const InitialState = () => (
    <div className="w-full h-screen flex items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-800">
        <div>
            <SparklesIcon className="mx-auto h-16 w-16 text-indigo-400" />
            <h2 className="mt-6 text-3xl font-bold text-gray-800 dark:text-gray-200">Let's Build Your Landing Page</h2>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                Use the floating control panel to get started.
            </p>
        </div>
    </div>
);

const ErrorState = ({ message }: { message: string }) => (
    <div className="w-full h-screen flex items-center justify-center p-8 text-center bg-red-50 dark:bg-red-900/20">
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-red-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
            <h2 className="mt-6 text-2xl font-bold text-red-800 dark:text-red-300">An Error Occurred</h2>
            <p className="mt-2 text-md text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-500/20 p-3 rounded-md">{message}</p>
        </div>
    </div>
);

const SectionWrapper = ({ sectionKey, onEditSection, children, animation }: { sectionKey: string, onEditSection?: (key: string) => void, children: React.ReactNode, animation?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isNav = sectionKey === 'nav';

    useEffect(() => {
        if (!ref.current || !animation || animation === 'none') return;
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    ref.current?.classList.add('is-visible');
                    observer.unobserve(ref.current!);
                }
            }, { threshold: 0.1 }
        );
        
        observer.observe(ref.current);
        
        return () => observer.disconnect();
    }, [animation]);
    
    const animationClass = animation && animation !== 'none' ? 'section-animate' : '';
    
    if (!onEditSection) {
        return <div id={sectionKey} ref={ref} className={animationClass}>{children}</div>;
    }

    return (
        <div id={sectionKey} ref={ref} className={`relative group ${animationClass}`}>
            <div
                className={`absolute inset-0 bg-indigo-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-4 border-dashed border-indigo-500 dark:border-indigo-400 pointer-events-none flex items-center justify-center rounded-lg ${isNav ? 'z-[60]' : 'z-30'}`}
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditSection(sectionKey); }}>
                 <button className="flex items-center gap-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 px-6 py-3 rounded-xl font-bold text-lg shadow-xl pointer-events-auto cursor-pointer transform group-hover:scale-105 transition-transform duration-300">
                    <EditIcon className="w-6 h-6" /> Edit {sectionKey === 'nav' ? 'Navigation' : sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}
                </button>
            </div>
            {children}
        </div>
    );
};

const LandingPagePreview: React.FC<LandingPagePreviewProps> = ({ pageId, data, images, allProducts, loading, error, onEditSection, onLinkClick, onRegenerateImage, regeneratingImages, onAddToCart, cartItems, setIsCartOpen, onSignInClick, onOpenBookingModal, courseAccess, onEnroll, courseProgress, onStartLesson, onTakeQuiz, themeMode, setThemeMode, customForms = [] }) => {
  if (loading) {
    return <LoadingState message={typeof loading === 'string' ? loading : 'Initializing...'} />;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  if (!data) {
    return <InitialState />;
  }
  
  const { theme, nav, sectionOrder } = data;

  const sectionComponents: { [key: string]: React.ReactNode } = {
    hero: data.hero && <HeroSection section={data.hero} theme={theme} images={images} onRegenerate={onRegenerateImage} regeneratingImages={regeneratingImages} allForms={customForms} pageId={pageId} onLinkClick={onLinkClick} />,
    features: data.features && <FeaturesSection section={data.features} theme={theme} />,
    whyChooseUs: data.whyChooseUs && <WhyChooseUsSection section={data.whyChooseUs} theme={theme} />,
    gallery: data.gallery && <GallerySection section={data.gallery} theme={theme} images={images} onRegenerateImage={onRegenerateImage} regeneratingImages={regeneratingImages} />,
    products: data.products && <ProductsSection section={data.products} allProducts={allProducts} theme={theme} images={images} onAddToCart={onAddToCart} regeneratingImages={regeneratingImages} onRegenerateImage={onRegenerateImage} />,
    course: data.course && <CourseSection section={data.course} theme={theme} images={images} onRegenerateImage={onRegenerateImage} regeneratingImages={regeneratingImages} hasAccess={courseAccess} onEnroll={onEnroll} progress={courseProgress} onStartLesson={onStartLesson} onTakeQuiz={onTakeQuiz} />,
    video: data.video && <VideoSection section={data.video} theme={theme} />,
    testimonials: data.testimonials && <TestimonialsSection section={data.testimonials} theme={theme} images={images} onRegenerateImage={onRegenerateImage} regeneratingImages={regeneratingImages} />,
    pricing: data.pricing && <PricingSection section={data.pricing} theme={theme} onLinkClick={onLinkClick} />,
    faq: data.faq && <FAQSection section={data.faq} theme={theme} />,
    contact: data.contact && <ContactSection section={data.contact} theme={theme} pageId={pageId} settings={data.bookingSettings} />,
    customForm: data.customForm && <CustomFormSection section={data.customForm} theme={theme} pageId={pageId} allForms={customForms} />,
    embed: data.embed && <EmbedSection section={data.embed} theme={theme} pageId={pageId} />,
    booking: data.booking && onOpenBookingModal && <BookingSection section={data.booking} theme={theme} onOpenModal={onOpenBookingModal} />,
    cta: data.cta && <CTASection section={data.cta} theme={theme} onLinkClick={onLinkClick} />,
    footer: data.footer && <FooterSection section={data.footer} theme={theme} />
  };

  return (
    <div className={`bg-white dark:bg-gray-900 text-${theme.textColorName}-800 dark:text-${theme.textColorName}-200 transition-colors duration-500`}>
        <SectionWrapper sectionKey="nav" onEditSection={onEditSection}>
            <Navbar 
              nav={nav} 
              theme={theme} 
              image={images['logo']} 
              isRegenerating={regeneratingImages.includes('logo')}
              cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              onCartClick={() => setIsCartOpen(true)}
              onSignInClick={onSignInClick}
              onBookingClick={() => onOpenBookingModal && onOpenBookingModal()}
              themeMode={themeMode}
              setThemeMode={setThemeMode}
              onLinkClick={onLinkClick}
            />
        </SectionWrapper>
        
        {sectionOrder.map(key => {
            const sectionData = data[key as keyof LandingPageData] as any;
            return sectionComponents[key] ?
            <SectionWrapper key={key} sectionKey={key} onEditSection={onEditSection} animation={sectionData?.animation}>
                {sectionComponents[key]}
            </SectionWrapper>
            : null
        })}
    </div>
  );
};

export default LandingPagePreview;