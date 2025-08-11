
import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import type { LandingPageData, ImageStore, ManagedPage, HeroSectionData, TestimonialsSectionData, SEOData, NavSectionData, ManagedProduct, CartItem, GallerySectionData, GeneratedProductsSectionData, CartSettings, BookingSettings, StripeSettings, CourseSectionData, MediaFile, GenerationConfig, ProductCategory, ProductItem, CourseLesson, CourseChapter, CrmForm, HeroSlide, ManagedOrder, CrmContact, PageGroup, TeamMember, OnboardingWizard, ProofingRequest, ManagedBooking, SeoReport } from './types';
import { generateLandingPageStructure, generateImageForPrompt, generateNewSection } from './services/geminiService';
import ControlPanel from './components/ControlPanel';
import LandingPagePreview from './components/LandingPagePreview';
import { TONES, PALETTES, SECTIONS, DEFAULT_PROMPT, INDUSTRIES } from './constants';
import { prepareExportPackage } from './services/exportService';
import * as pageService from './services/pageService';
import * as storageService from './services/storageService';
import * as categoryService from './services/categoryService';
import * as productService from './services/productService';
import * as contactService from './services/contactService';
import * as orderService from './services/orderService';
import * as groupService from './services/groupService';
import * as teamService from './services/teamService';
import * as onboardingService from './services/onboardingService';
import * as proofingService from './services/proofingService';
import * as bookingService from './services/bookingService';
import * as seoService from './services/seoService';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import AccountPopover from './AccountPopover';
import LoaderIcon from './components/icons/LoaderIcon';
import { usePagesCache } from './hooks/usePagesCache';

const EditModal = React.lazy(() => import('./components/EditModal'));
const DashboardModal = React.lazy(() => import('./DashboardModal'));
const SEOModal = React.lazy(() => import('./components/SEOModal'));
const CartModal = React.lazy(() => import('./components/CartModal'));
const CheckoutModal = React.lazy(() => import('./components/CheckoutModal'));
const BookingModal = React.lazy(() => import('./components/BookingModal'));
const PublishModal = React.lazy(() => import('./PublishModal'));
const AppSettingsModal = React.lazy(() => import('./AppSettingsModal'));
const LessonViewerModal = React.lazy(() => import('./components/LessonViewerModal').then(module => ({ default: module.LessonViewerModal })));
const CustomerPortalModal = React.lazy(() => import('./components/CustomerPortalModal'));
const QuizModal = React.lazy(() => import('./components/QuizModal'));
const OnboardingWizardModal = React.lazy(() => import('./components/OnboardingWizardModal'));


type ExportFile = {
    content: string;
    type: 'string' | 'base64';
};

interface EditorProps {
    session: Session;
}

const getImageKeysForSection = (sectionKey: string, sectionData: any): string[] => {
    if (!sectionData) return [];
    switch(sectionKey) {
        case 'hero': {
            const keys = [];
            if (sectionData.layout === 'split' && sectionData.splitImagePrompt) {
                keys.push('hero_split');
            }
            if (sectionData.backgroundType === 'image' && sectionData.imagePrompt) {
                keys.push('hero');
            }
            if (sectionData.backgroundType === 'slider' && sectionData.slides) {
                sectionData.slides.forEach((_: any, i: number) => keys.push(`hero_slider_${i}`));
            }
            return keys;
        }
        case 'nav': return sectionData.logoType === 'image' ? ['logo'] : [];
        case 'testimonials': return sectionData.items?.map((_: any, i: number) => `testimonial_${i}`) || [];
        case 'gallery': return sectionData.items?.map((_: any, i: number) => `gallery_${i}`) || [];
        // Images for products are now handled globally via the managed product's image prompt
        case 'course': {
            let keys = [];
            if (sectionData.mediaType === 'image' || !sectionData.mediaType) {
                keys.push('course_banner');
            }
            if (sectionData.chapters) {
                sectionData.chapters.forEach((chapter: CourseChapter) => {
                    if(chapter.imagePrompt) keys.push(`chapter_${chapter.id}`);
                    if (chapter.lessons) {
                        chapter.lessons.forEach((lesson: CourseLesson) => {
                            if (lesson.imagePrompt) {
                                keys.push(`lesson_${lesson.id}`);
                            }
                        });
                    }
                });
            }
            return keys;
        }
        default: return [];
    }
};

const ModalLoader = () => (
    <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center">
        <LoaderIcon className="w-12 h-12 text-white" />
    </div>
);

export default function Editor({ session }: EditorProps): React.ReactElement {
    const [activePage, setActivePage] = useState<ManagedPage | null>(null);
    const [isDashboardOpen, setDashboardOpen] = useState(true);
    const [initialDashboardTab, setInitialDashboardTab] = useState<string | undefined>(undefined);
    
    const [prompt, setPrompt] = useState<string>(() => localStorage.getItem('ai-lp-generator-prompt') || DEFAULT_PROMPT);
    const [tone, setTone] = useState<string>(() => localStorage.getItem('ai-lp-generator-tone') || TONES[0]);
    const [palette, setPalette] = useState<string>(() => localStorage.getItem('ai-lp-generator-palette') || PALETTES[0]);
    const [industry, setIndustry] = useState<string>(() => localStorage.getItem('ai-lp-generator-industry') || INDUSTRIES[0]);
    const [oldSiteUrl, setOldSiteUrl] = useState('');
    const [inspirationUrl, setInspirationUrl] = useState('');
    
    const [landingPageData, setLandingPageData] = useState<LandingPageData | null>(null);
    const [images, setImages] = useState<ImageStore>({});
    const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
        const savedOrder = localStorage.getItem('ai-lp-generator-sectionOrder');
        try {
            return savedOrder ? JSON.parse(savedOrder) : ['hero', 'features', 'testimonials', 'pricing', 'faq', 'cta', 'footer'];
        } catch (e) {
            console.error("Could not parse section order from localStorage", e);
            return ['hero', 'features', 'testimonials', 'pricing', 'faq', 'cta', 'footer'];
        }
    });
    
    const [isLoading, setIsLoading] = useState<false | string>(false);
    const [isUpdatingSections, setIsUpdatingSections] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [regeneratingImages, setRegeneratingImages] = useState<string[]>([]);
    const [isSeoModalOpen, setSeoModalOpen] = useState(false);
    const [isPublishModalOpen, setPublishModalOpen] = useState(false);
    const [isAppSettingsModalOpen, setAppSettingsModalOpen] = useState(false);
    const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState(false);
    const [isAccountPopoverOpen, setAccountPopoverOpen] = useState(false);
    
    // TEMPORARILY DISABLE CACHE - USE DIRECT LOADING
    const [managedPages, setManagedPages] = useState<ManagedPage[]>([]);
    const [isPagesLoading, setIsPagesLoading] = useState(true);
    
    // Lazy loaded data (only load when needed)
    const [userMediaFiles, setUserMediaFiles] = useState<MediaFile[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
    const [managedProducts, setManagedProducts] = useState<ManagedProduct[]>([]);
    const [customForms, setCustomForms] = useState<CrmForm[]>([]);
    const [managedOrders, setManagedOrders] = useState<ManagedOrder[]>([]);
    const [crmContacts, setCrmContacts] = useState<CrmContact[]>([]);
    const [pageGroups, setPageGroups] = useState<PageGroup[]>([]);
    const [contactList, setContactList] = useState<{ id: number, name: string | null }[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [onboardingWizards, setOnboardingWizards] = useState<OnboardingWizard[]>([]);
    const [proofingRequests, setProofingRequests] = useState<ProofingRequest[]>([]);
    const [managedBookings, setManagedBookings] = useState<ManagedBooking[]>([]);
    const [seoReports, setSeoReports] = useState<SeoReport[]>([]);

    // E-commerce state
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // Course state
    const [hasCourseAccess, setHasCourseAccess] = useState(true); // Default to true in editor
    const [courseProgress, setCourseProgress] = useState<Record<string, 'completed'>>({});
    const [activeLesson, setActiveLesson] = useState<number | null>(null);
    const [quizForChapter, setQuizForChapter] = useState<CourseChapter | null>(null);

    // Onboarding state
    const [activeWizard, setActiveWizard] = useState<OnboardingWizard | null>(null);
    
    const isInitialMount = useRef(true);

    const refreshAllData = useCallback(async () => {
        setIsPagesLoading(true);
        setError(null); // Clear any previous errors
        
        try {
            console.log('[EDITOR] refreshAllData: Loading data for user ID:', session.user.id);
            
            // Load pages with optimized query and retry logic
            let pages: ManagedPage[] = [];
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
                try {
                    console.log(`[EDITOR] Loading pages attempt ${retryCount + 1}/${maxRetries}`);
                    pages = await pageService.getPagesList(session.user.id); // Use optimized function
                    console.log('[EDITOR] Pages loaded successfully:', pages.length);
                    console.log('[EDITOR] First few pages:', pages.slice(0, 3).map(p => ({ id: p.id, name: p.name, groupName: p.groupName })));
                    setManagedPages(pages);
                    break; // Success - exit retry loop
                } catch (pageError: any) {
                    retryCount++;
                    console.error(`[EDITOR] Error loading pages (attempt ${retryCount}):`, pageError);
                    
                    if (pageError?.code === '57014' || pageError?.message?.includes('timeout')) {
                        console.log('[EDITOR] Database timeout detected, retrying with delay...');
                        if (retryCount < maxRetries) {
                            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
                            continue;
                        }
                    }
                    
                    // If max retries reached or non-timeout error
                    if (retryCount >= maxRetries) {
                        console.error('[EDITOR] Failed to load pages after all retries');
                        setManagedPages([]);
                        break;
                    }
                }
            }
            
            // Load other data with individual error handling (non-blocking)
            try {
                const media = await storageService.listFiles(session.user.id);
                setUserMediaFiles(media);
            } catch (error) {
                console.warn('[EDITOR] Error loading media:', error);
                setUserMediaFiles([]);
            }

            try {
                const categories = await categoryService.getCategories(session.user.id);
                setProductCategories(categories);
            } catch (error) {
                console.warn('[EDITOR] Error loading categories:', error);
                setProductCategories([]);
            }

            try {
                const products = await productService.getProducts(session.user.id);
                setManagedProducts(products);
            } catch (error) {
                console.warn('[EDITOR] Error loading products:', error);
                setManagedProducts([]);
            }

            try {
                const forms = await contactService.getForms(session.user.id);
                setCustomForms(forms);
            } catch (error) {
                console.warn('[EDITOR] Error loading forms:', error);
                setCustomForms([]);
            }

            try {
                const contacts = await contactService.getContacts(session.user.id);
                setCrmContacts(contacts);
            } catch (error) {
                console.warn('[EDITOR] Error loading contacts:', error);
                setCrmContacts([]);
            }

            try {
                const groups = await groupService.getGroups(session.user.id);
                setPageGroups(groups);
            } catch (error) {
                console.warn('[EDITOR] Error loading groups:', error);
                setPageGroups([]);
            }

            try {
                const contactList = await contactService.getContactList(session.user.id);
                setContactList(contactList);
            } catch (error) {
                console.warn('[EDITOR] Error loading contact list:', error);
                setContactList([]);
            }

            try {
                const team = await teamService.getTeamMembers(session.user.id);
                setTeamMembers(team);
            } catch (error) {
                console.warn('[EDITOR] Error loading team:', error);
                setTeamMembers([]);
            }

            try {
                const wizards = await onboardingService.getWizards(session.user.id);
                setOnboardingWizards(wizards);
            } catch (error) {
                console.warn('[EDITOR] Error loading wizards:', error);
                setOnboardingWizards([]);
            }

            try {
                const proofs = await proofingService.getProofingRequests(session.user.id);
                setProofingRequests(proofs);
            } catch (error) {
                console.warn('[EDITOR] Error loading proofs:', error);
                setProofingRequests([]);
            }

            try {
                const bookings = await bookingService.getBookingsForUser(session.user.id);
                setManagedBookings(bookings);
            } catch (error) {
                console.warn('[EDITOR] Error loading bookings:', error);
                setManagedBookings([]);
            }

            try {
                const reports = await seoService.getSeoReports(session.user.id);
                setSeoReports(reports);
            } catch (error) {
                console.warn('[EDITOR] Error loading SEO reports:', error);
                setSeoReports([]);
            }

            // Handle orders separately
            try {
                const ordersRaw = await orderService.getOrdersForUser(session.user.id);
                const pageMap = new Map(managedPages.map(p => [p.id, p.name]));
                const orders: ManagedOrder[] = ordersRaw
                  .filter(rawOrder => rawOrder.data)
                  .map(rawOrder => {
                    const orderData = rawOrder.data as unknown as any;
                    return {
                        id: String(rawOrder.id),
                        pageId: rawOrder.page_id,
                        pageName: pageMap.get(rawOrder.page_id) || 'Unknown Page',
                        createdAt: rawOrder.created_at,
                        customer: {
                            name: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
                            email: orderData.customerInfo.email,
                            shippingAddress: orderData.customerInfo.address,
                        },
                        items: orderData.items,
                        total: orderData.total,
                        status: orderData.status,
                    };
                });
                setManagedOrders(orders);
            } catch (orderError) {
                console.warn('[EDITOR] Error loading orders:', orderError);
                setManagedOrders([]);
            }
            
            return { success: true };
        } catch (e) {
            console.error("Critical error in refreshAllData:", e);
            // Don't set error if we have pages - Dashboard can still function
            if (managedPages.length === 0) {
                setError("Could not load dashboard data. Please try refreshing.");
            }
            return { success: false };
        } finally {
            setIsPagesLoading(false);
        }
    }, [session.user.id, managedPages]);

    const loadPage = useCallback((page: ManagedPage) => {
        setActivePage(page);
        setLandingPageData(page.data);
        setImages(page.images || {});
        if (page.data?.sectionOrder) {
            setSectionOrder(page.data.sectionOrder);
        }
        setDashboardOpen(false);
        setHasUnsavedChanges(false);
    }, []);

    const loadPageById = useCallback(async (pageId: string, pages: ManagedPage[]) => {
        console.log('[EDITOR] Loading page by ID:', pageId);
        setIsLoading('Loading page content...');
        
        try {
            // First check if we have basic page info
            const basicPageInfo = pages.find(p => p.id === pageId);
            if (!basicPageInfo) {
                console.warn(`Page with ID ${pageId} not found in basic pages list.`);
                setIsLoading(false);
                if (pages.length > 0) {
                    loadPage(pages[0]);
                } else {
                    setDashboardOpen(true);
                }
                return;
            }

            // Load full page data with JSON content
            console.log('[EDITOR] Loading full page data from database...');
            const fullPageData = await pageService.getFullPageData(pageId);
            
            if (fullPageData) {
                console.log('[EDITOR] Full page data loaded, setting as active page');
                loadPage(fullPageData);
            } else {
                console.warn('[EDITOR] Failed to load full page data, using basic info');
                loadPage(basicPageInfo);
            }
        } catch (error) {
            console.error('[EDITOR] Error loading full page data:', error);
            // Fallback to basic page info if full data fails
            const basicPageInfo = pages.find(p => p.id === pageId);
            if (basicPageInfo) {
                loadPage(basicPageInfo);
            } else if (pages.length > 0) {
                loadPage(pages[0]);
            } else {
                setDashboardOpen(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, [loadPage]);
    
    const loadSettingsFromPage = useCallback(() => {
        let settingsLoaded = false;
        if (activePage?.generationConfig) {
            setPrompt(activePage.generationConfig.prompt);
            setTone(activePage.generationConfig.tone);
            setPalette(activePage.generationConfig.palette);
            setIndustry(activePage.generationConfig.industry);
            setOldSiteUrl(activePage.generationConfig.oldSiteUrl || '');
            setInspirationUrl(activePage.generationConfig.inspirationUrl || '');
            settingsLoaded = true;
        }
        if (activePage?.data?.sectionOrder) {
            setSectionOrder(activePage.data.sectionOrder);
            settingsLoaded = true;
        }
    
        if (!settingsLoaded) {
            alert("No saved generation settings to load for this page.");
        }
    }, [activePage]);
    
    useEffect(() => {
        refreshAllData().then(({ pages }) => {
            if (pages.length > 0) {
                loadPage(pages[0]);
            } else {
                setDashboardOpen(true);
            }
        });
        const savedTheme = localStorage.getItem('themeMode') as 'light' | 'dark' || 'dark';
        setThemeMode(savedTheme);
    }, []);
    
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (!landingPageData || isUpdatingSections) return;
        
        const handleSectionChanges = async () => {
            const currentSectionKeys = Object.keys(landingPageData).filter(key => SECTIONS[key as keyof typeof SECTIONS]);
            const added = sectionOrder.filter(key => !currentSectionKeys.includes(key));

            if (added.length === 0) {
                // If only reordering or removals occurred, just update the data object's order.
                // The dirty flag is already set by the ControlPanel.
                setLandingPageData(prev => prev ? ({ ...prev, sectionOrder }) : null);
                return;
            }
            
            setIsUpdatingSections(true);

            try {
                let newData = { ...landingPageData };
                let newImages = { ...images };

                for (const key of added) {
                    const sectionData = await generateNewSection(prompt, tone, palette, industry, key, userMediaFiles);
                    (newData as any)[key] = sectionData;

                    const imageKeys = getImageKeysForSection(key, sectionData);
                     if (imageKeys.length > 0) {
                        const imagePrompt = (sectionData as any).imagePrompt || (sectionData as any).items?.[0]?.avatarImagePrompt || (sectionData as any).items?.[0]?.imagePrompt;
                         if(imagePrompt && !imagePrompt.startsWith('http')) {
                            const base64 = await generateImageForPrompt(imagePrompt);
                            newImages[imageKeys[0]] = `data:image/jpeg;base64,${base64}`;
                        }
                    }
                }
                
                newData.sectionOrder = sectionOrder;
                setLandingPageData(newData);
                setImages(newImages);
                // The parent component (`ControlPanel`) has already set hasUnsavedChanges to true
            } catch (e) {
                console.error("Error generating new section:", e);
                setError((e as Error).message);
                // Revert sectionOrder on error
                setSectionOrder(currentSectionKeys);
            } finally {
                setIsUpdatingSections(false);
            }
        };

        handleSectionChanges();
        
    }, [sectionOrder]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(themeMode === 'light' ? 'dark' : 'light');
        root.classList.add(themeMode);
        localStorage.setItem('themeMode', themeMode);
    }, [themeMode]);

    // Persist control panel settings to localStorage
    useEffect(() => { localStorage.setItem('ai-lp-generator-prompt', prompt); }, [prompt]);
    useEffect(() => { localStorage.setItem('ai-lp-generator-tone', tone); }, [tone]);
    useEffect(() => { localStorage.setItem('ai-lp-generator-palette', palette); }, [palette]);
    useEffect(() => { localStorage.setItem('ai-lp-generator-industry', industry); }, [industry]);
    useEffect(() => { localStorage.setItem('ai-lp-generator-sectionOrder', JSON.stringify(sectionOrder)); }, [sectionOrder]);


    const handleGenerate = useCallback(async () => {
        if (!activePage) {
            alert("Please select or create a page first from 'My Pages'.");
            return;
        }

        if (sectionOrder.includes('products') && productCategories.length === 0) {
            alert("Please create at least one product category before generating a page with products.\n\nYou can do this in the Dashboard under:\nManagement -> Products & Services -> Categories");
            setInitialDashboardTab('store');
            setDashboardOpen(true);
            return;
        }

        setIsLoading('Generating content structure...');
        setError(null);
        setLandingPageData(null);
        setImages({});
        setEditingSectionKey(null);
        setSeoModalOpen(false);
        setDashboardOpen(false);
        setHasUnsavedChanges(true); // A full generation is an unsaved change until saved.

        try {
            const data = await generateLandingPageStructure(prompt, tone, palette, sectionOrder, industry, userMediaFiles, productCategories, managedProducts, undefined, oldSiteUrl, inspirationUrl);
            
            let finalData: LandingPageData = { ...data, products: undefined };

            if (data.products) {
                setIsLoading('Syncing products & categories...');
                const genProducts = ((data.products as unknown as GeneratedProductsSectionData).items || []).filter(p => p && p.category);
                const finalProductIds: string[] = [];

                const validCategoryNames = new Set(productCategories.map(c => c.name));
                const defaultCategory = productCategories[0].name;
                
                genProducts.forEach((p: ProductItem) => {
                    if (!p.category || !validCategoryNames.has(p.category)) {
                        console.warn(`AI generated an invalid or missing category "${p.category}". Falling back to default "${defaultCategory}".`);
                        p.category = defaultCategory;
                    }
                });
                
                let currentProducts = [...managedProducts];
                const categoryMap = new Map(productCategories.map(c => [c.name, c.id]));

                for (const genProduct of genProducts) {
                    const categoryId = categoryMap.get(genProduct.category) || null;
                    const newProduct: Omit<ManagedProduct, 'id' | 'user_id' | 'created_at'> = {
                        name: genProduct.name, description: genProduct.description, price: genProduct.price, status: genProduct.status,
                        fulfillment_type: genProduct.fulfillment_type, category: genProduct.category, category_id: categoryId,
                        featured_image_url: genProduct.featured_image_url, gallery_images: genProduct.gallery_images, options: genProduct.options,
                    };

                    const createdProduct = await productService.createProduct(session.user.id, newProduct);
                    finalProductIds.push(createdProduct.id);
                    currentProducts.push(createdProduct);
                }
                setManagedProducts(currentProducts);
                
                finalData.products = {
                    title: (data.products as any).title, subtitle: (data.products as any).subtitle, itemIds: finalProductIds,
                };
            }
            
            setLandingPageData(finalData);
            if (finalData.sectionOrder) setSectionOrder(finalData.sectionOrder);
            
            setIsLoading('Processing images...');
            
            const promptsToGenerate: { key: string; prompt: string; aspectRatio: '16:9' | '1:1' }[] = [];
            const foundImages: ImageStore = {};

            const processImageField = (key: string, promptOrUrl: string | undefined, aspectRatio: '16:9' | '1:1') => {
                if (!promptOrUrl) return;
                if (promptOrUrl.startsWith('http') || promptOrUrl.startsWith('data:')) {
                    foundImages[key] = promptOrUrl;
                } else {
                    promptsToGenerate.push({ key, prompt: promptOrUrl, aspectRatio });
                }
            };

            if(data.hero?.layout === 'split') processImageField('hero_split', data.hero.splitImagePrompt, '1:1');
            if(data.hero?.backgroundType === 'image') processImageField('hero', data.hero.imagePrompt, '16:9');
            if(data.hero?.backgroundType === 'slider' && data.hero.slides) data.hero.slides.forEach((p, i) => processImageField(`hero_slider_${i}`, p.imagePrompt, '16:9'));
            if (data.nav?.logoType === 'image') processImageField('logo', data.nav.logoImagePrompt, '1:1');
            (data.testimonials?.items || []).forEach((item, index) => processImageField(`testimonial_${index}`, item.avatarImagePrompt, '1:1'));
            (data.gallery?.items || []).forEach((item, index) => processImageField(`gallery_${index}`, item.imagePrompt, '1:1'));
            if (data.seo?.ogImagePrompt) processImageField('og_image', data.seo.ogImagePrompt, '16:9');

            const newProducts = managedProducts.filter(p => finalData.products?.itemIds.includes(p.id));
            newProducts.forEach(p => {
                if (p.featured_image_url && !p.featured_image_url.startsWith('http')) {
                    promptsToGenerate.push({ key: `product_${p.id}`, prompt: p.featured_image_url, aspectRatio: '1:1' })
                }
                (p.gallery_images || []).forEach((imgPrompt, i) => {
                     if (imgPrompt && !imgPrompt.startsWith('http')) {
                        promptsToGenerate.push({ key: `product_${p.id}_gallery_${i}`, prompt: imgPrompt, aspectRatio: '1:1' })
                    }
                })
            });

            processImageField('course_banner', data.course?.mediaType === 'image' ? data.course.imagePrompt : undefined, '16:9');
            (data.course?.chapters || []).forEach(chapter => {
                processImageField(`chapter_${chapter.id}`, chapter.imagePrompt, '16:9');
                (chapter.lessons || []).forEach(lesson => processImageField(`lesson_${lesson.id}`, lesson.imagePrompt, '1:1'));
            });

            setImages(foundImages);
            let finalImages = { ...foundImages };

            if (promptsToGenerate.length > 0) {
                setIsLoading(`Generating ${promptsToGenerate.length} new image(s)...`);
                const imageResults = await Promise.allSettled(
                    promptsToGenerate.map(p => generateImageForPrompt(p.prompt, p.aspectRatio))
                );

                const newImages: ImageStore = {};
                imageResults.forEach((result, index) => {
                    const key = promptsToGenerate[index].key;
                    if (result.status === 'fulfilled') newImages[key] = `data:image/jpeg;base64,${result.value}`;
                    else {
                        console.error(`Failed to generate image for ${key}:`, result.reason);
                        newImages[key] = 'https://picsum.photos/1280/720?grayscale';
                    }
                });
                finalImages = { ...foundImages, ...newImages };
                setImages(finalImages);
            }
            
            // Do not save here, just set the dirty flag
            
        } catch (e) {
            const err = e as Error;
            console.error('Error during page generation:', err.message, err);
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, tone, palette, sectionOrder, industry, activePage, userMediaFiles, productCategories, managedProducts, session.user.id, oldSiteUrl, inspirationUrl, refreshAllData]);

    const handleOpenEditModal = (sectionKey: string) => { if (!isLoading) setEditingSectionKey(sectionKey); };
    const handleCloseEditModal = () => setEditingSectionKey(null);
  
    const handleSaveSection = async (sectionKey: string, newSectionData: any) => {
        if (!landingPageData || !activePage) return;

        const oldSectionData = landingPageData[sectionKey as keyof LandingPageData];
        
        // Find which image prompts have changed
        const imagePromptsToUpdate: { key: string; prompt: string; aspectRatio: '16:9' | '1:1' }[] = [];

        const checkImageField = (oldPromptOrUrl: string | undefined, newPromptOrUrl: string | undefined, key: string, ratio: '16:9' | '1:1') => {
            if (newPromptOrUrl !== oldPromptOrUrl) {
                if (newPromptOrUrl && !(newPromptOrUrl.startsWith('http') || newPromptOrUrl.startsWith('data:image'))) {
                    imagePromptsToUpdate.push({ key, prompt: newPromptOrUrl, aspectRatio: ratio });
                }
            }
        };

        if (sectionKey === 'nav') checkImageField((oldSectionData as any)?.logoImagePrompt, newSectionData.logoImagePrompt, 'logo', '1:1');
        if (sectionKey === 'hero') {
            const oldHero = oldSectionData as any;
            checkImageField(oldHero?.splitImagePrompt, newSectionData.splitImagePrompt, 'hero_split', '1:1');
            if (newSectionData.backgroundType === 'image') checkImageField(oldHero?.imagePrompt, newSectionData.imagePrompt, 'hero', '16:9');
            if (newSectionData.backgroundType === 'slider') (newSectionData.slides || []).forEach((slide: HeroSlide, i: number) => checkImageField(oldHero?.slides?.[i]?.imagePrompt, slide.imagePrompt, `hero_slider_${i}`, '16:9'));
        }
        if (sectionKey === 'testimonials') (newSectionData.items || []).forEach((item: any, i: number) => checkImageField((oldSectionData as any)?.items?.[i]?.avatarImagePrompt, item.avatarImagePrompt, `testimonial_${i}`, '1:1'));
        if (sectionKey === 'gallery') (newSectionData.items || []).forEach((item: any, i: number) => checkImageField((oldSectionData as any)?.items?.[i]?.imagePrompt, item.imagePrompt, `gallery_${i}`, '1:1'));
        if (sectionKey === 'course') {
            const oldCourse = oldSectionData as CourseSectionData;
            checkImageField(oldCourse?.imagePrompt, newSectionData.imagePrompt, `course_banner`, '16:9');
            (newSectionData.chapters || []).forEach((chapter: CourseChapter) => {
                const oldChapter = (oldCourse?.chapters || []).find((c: any) => c.id === chapter.id);
                checkImageField(oldChapter?.imagePrompt, chapter.imagePrompt, `chapter_${chapter.id}`, '16:9');
                (chapter.lessons || []).forEach((lesson: any) => {
                    const oldLesson = (oldChapter?.lessons || []).find((l: any) => l.id === lesson.id);
                    checkImageField(oldLesson?.imagePrompt, lesson.imagePrompt, `lesson_${lesson.id}`, '1:1');
                });
            });
        }
        
        let finalImages = { ...images };
        
        // Generate new images if any prompts changed
        if (imagePromptsToUpdate.length > 0) {
            setRegeneratingImages(imagePromptsToUpdate.map(p => p.key));
            const results = await Promise.allSettled(
                imagePromptsToUpdate.map(p => generateImageForPrompt(p.prompt, p.aspectRatio))
            );
            
            results.forEach((res, i) => {
                const { key } = imagePromptsToUpdate[i];
                if (res.status === 'fulfilled') {
                    finalImages[key] = `data:image/jpeg;base64,${res.value}`;
                } else {
                     console.error(`Failed to regenerate image for key ${key}:`, res.reason);
                }
            });
            setRegeneratingImages([]);
        }

        // Atomically update both page data and images state
        const newLandingPageData = { ...landingPageData, [sectionKey]: newSectionData };
        setLandingPageData(newLandingPageData);
        setImages(finalImages);
        setHasUnsavedChanges(true);
    };
    
    const handleSaveProgress = async () => {
        if (!activePage || !landingPageData) return;
        setSaveStatus('saving');
        try {
            const generationConfig: GenerationConfig = { prompt, tone, palette, industry, oldSiteUrl, inspirationUrl };
            const pageToSave = { ...activePage, data: landingPageData, images, generationConfig };
            const updatedPage = await pageService.savePage(pageToSave);
            setActivePage(updatedPage); // Update active page with new updated_at timestamp etc.
            setHasUnsavedChanges(false);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (e) {
            console.error(e);
            setSaveStatus('idle');
            alert("Failed to save progress.");
        }
    };

    const handleExportPage = async () => {
        if (!landingPageData || !activePage) {
            alert("No page data to export.");
            return;
        }
        
        const zip = new JSZip();
        const exportPackage = prepareExportPackage(landingPageData, images, managedProducts, managedPages);
        
        Object.entries(exportPackage).forEach(([filename, file]) => {
            const f = file as ExportFile;
            zip.file(filename, f.content, { base64: f.type === 'base64' });
        });
        
        const blob = await zip.generateAsync({ type: 'blob' });
        saveAs(blob, `${activePage.name.replace(/\s+/g, '_').toLowerCase()}_export.zip`);
    };

    const handleSaveSeo = async (newSeoData: SEOData) => {
        if (!landingPageData || !activePage) return;

        const oldSeoData = landingPageData.seo;
        const newLandingPageData = { ...landingPageData, seo: newSeoData };
        setLandingPageData(newLandingPageData);
        setSeoModalOpen(false);
        setHasUnsavedChanges(true);
        
        if (newSeoData.ogImagePrompt && newSeoData.ogImagePrompt !== oldSeoData?.ogImagePrompt && !newSeoData.ogImagePrompt.startsWith('http')) {
            setRegeneratingImages(['og_image']);
            try {
                const base64 = await generateImageForPrompt(newSeoData.ogImagePrompt, '16:9');
                const newImages = { ...images, 'og_image': `data:image/jpeg;base64,${base64}`};
                setImages(newImages);
            } catch (e) {
                console.error("Failed to generate OG image", e);
            } finally {
                 setRegeneratingImages([]);
            }
        }
    };
    
    const handleSaveAppSettings = async (cartSettings: CartSettings, bookingSettings: BookingSettings, stripeSettings: StripeSettings, headScripts: string, bodyScripts: string) => {
        if (!activePage || !landingPageData) return;
        
        const newLandingPageData = { ...landingPageData, cartSettings, bookingSettings, stripeSettings, headScripts, bodyScripts };
        setLandingPageData(newLandingPageData);
        setHasUnsavedChanges(true);
        setAppSettingsModalOpen(false);
    };

    const handleCreateNewPage = async (pageName: string) => {
        setIsLoading('Creating new page...');
        try {
            const newPage = await pageService.createPage(pageName, session.user.id);
            const { pages } = await refreshAllData();
            await loadPageById(newPage.id, pages);
        } catch (e) {
            console.error("Failed to create page:", e);
        } finally {
            setIsLoading(false);
        }
    };
    
    // E-commerce state and handlers
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    
    const handleAddToCart = (product: ManagedProduct, selectedOptions: Record<string, string> = {}) => {
        let finalPrice = product.price || 0;
        const variantDescriptionParts: string[] = [];

        if (product.options) {
            for (const option of product.options) {
                const selectedValue = selectedOptions[option.name];
                if (selectedValue) {
                    const valueObj = option.values.find(v => v.value === selectedValue);
                    if (valueObj) {
                        finalPrice += valueObj.priceModifier;
                        variantDescriptionParts.push(`${option.name}: ${selectedValue}`);
                    }
                }
            }
        }
        
        const variantDescription = variantDescriptionParts.join(', ');
        const cartId = `${product.id}-${variantDescription}`; // Unique ID for each variant combination

        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === cartId);
            if (existingItem) {
                return prevItems.map(item => item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prevItems, { ...product, id: cartId, quantity: 1, finalPrice, variantDescription }];
        });
        setIsCartOpen(true);
    };

    const handleUpdateCartQuantity = (productId: string, quantity: number) => {
        setCartItems(prevItems => {
            if (quantity <= 0) return prevItems.filter(item => item.id !== productId);
            return prevItems.map(item => item.id === productId ? { ...item, quantity } : item);
        });
    };
    const handleRemoveFromCart = (productId: string) => setCartItems(prev => prev.filter(item => item.id !== productId));
    const handleCheckout = () => { setIsCartOpen(false); setIsCheckoutOpen(true); };
    
    const handleCheckoutSuccess = (purchasedItems: CartItem[]) => {
        if (purchasedItems.some(item => item.fulfillment_type === 'VideoCourse')) {
            setHasCourseAccess(true);
        }
        setCartItems([]);
        refreshAllData();
    };

    // Onboarding handlers
    const handleOpenWizard = (wizardId: string) => {
        const wizard = onboardingWizards.find(w => w.id === wizardId);
        if (wizard) {
            setActiveWizard(wizard);
        } else {
            console.warn(`Could not find wizard with ID: ${wizardId}`);
        }
    };
    
    const handleWizardSubmit = async (submissionData: Record<string, any>) => {
        if (!activeWizard) return;
        await onboardingService.createSubmission(activeWizard.id, session.user.id, submissionData);
        setActiveWizard(null);
        alert("Thank you for your submission!");
    };

    const handleLinkClick = (e: React.MouseEvent, link: string) => {
        e.preventDefault();
        if (!link) return;
    
        if (link.startsWith('#')) {
            const id = link.substring(1);
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        } else if (link.startsWith('page:')) {
            alert('Navigation to other pages is disabled in the editor preview.');
        } else if (link.startsWith('modal:')) {
            const modalType = link.split(':')[1];
            if (modalType === 'cart') setIsCartOpen(true);
            if (modalType === 'signin') setIsCustomerPortalOpen(true);
            if (modalType === 'booking') setIsBookingModalOpen(true);
        } else if (link.startsWith('http')) {
            window.open(link, '_blank', 'noopener,noreferrer');
        } else {
            // Fallback for relative links if any
            alert(`Link to "${link}" is not supported in the editor.`);
        }
    };


    return (
        <div className={`w-full h-screen flex flex-col font-sans ${themeMode}`}>
            <ControlPanel
                prompt={prompt} setPrompt={setPrompt}
                tone={tone} setTone={setTone}
                palette={palette} setPalette={setPalette}
                industry={industry} setIndustry={setIndustry}
                isLoading={!!isLoading}
                onGenerate={handleGenerate}
                themeMode={themeMode} setThemeMode={setThemeMode}
                isGenerated={!!landingPageData}
                onSaveProgress={handleSaveProgress}
                onExportPage={handleExportPage}
                saveStatus={saveStatus}
                hasUnsavedChanges={hasUnsavedChanges}
                onShowDashboard={() => setDashboardOpen(true)}
                onShowSeoModal={() => setSeoModalOpen(true)}
                onShowPublishModal={() => setPublishModalOpen(true)}
                onShowAppSettingsModal={() => setAppSettingsModalOpen(true)}
                sectionOrder={sectionOrder}
                setSectionOrder={setSectionOrder}
                setHasUnsavedChanges={setHasUnsavedChanges}
                pageData={landingPageData}
                onShowAccount={() => setAccountPopoverOpen(!isAccountPopoverOpen)}
                activePage={activePage}
                onLoadSettings={loadSettingsFromPage}
                onEditSection={handleOpenEditModal}
                oldSiteUrl={oldSiteUrl}
                setOldSiteUrl={setOldSiteUrl}
                inspirationUrl={inspirationUrl}
                setInspirationUrl={setInspirationUrl}
            />
             {isAccountPopoverOpen && (
                <AccountPopover
                    user={session.user}
                    onLogout={() => supabase.auth.signOut()}
                    onClose={() => setAccountPopoverOpen(false)}
                />
            )}
            <main className="flex-grow w-full overflow-y-auto">
                <LandingPagePreview
                    pageId={activePage?.id}
                    data={landingPageData}
                    images={images}
                    allProducts={managedProducts}
                    loading={isLoading}
                    error={error}
                    onEditSection={handleOpenEditModal}
                    onLinkClick={handleLinkClick}
                    onRegenerateImage={async (key, p, ratio) => {
                         setRegeneratingImages(prev => [...prev, key]);
                         try {
                            const base64 = await generateImageForPrompt(p, ratio);
                            setImages(prev => ({...prev, [key]: `data:image/jpeg;base64,${base64}`}));
                            setHasUnsavedChanges(true);
                         } finally {
                            setRegeneratingImages(prev => prev.filter(k => k !== key));
                         }
                    }}
                    regeneratingImages={regeneratingImages}
                    onAddToCart={handleAddToCart}
                    cartItems={cartItems}
                    setIsCartOpen={setIsCartOpen}
                    onSignInClick={() => setIsCustomerPortalOpen(true)}
                    onOpenBookingModal={() => setIsBookingModalOpen(true)}
                    courseAccess={hasCourseAccess}
                    onEnroll={(course) => {
                        if (!activePage) return;
                        const courseAsCartItem: CartItem = {
                            id: `course_${activePage.id}`, name: course.title, description: course.description, price: course.price, status: 'Active',
                            fulfillment_type: 'VideoCourse', category_id: null, category: 'Online Courses', featured_image_url: images['course_banner'] || null, gallery_images: [], options: [], quantity: 1, finalPrice: course.price,
                            user_id: activePage.userId, created_at: new Date().toISOString()
                        };
                        setCartItems(prev => [...prev, courseAsCartItem]);
                        setIsCartOpen(true);
                    }}
                    courseProgress={courseProgress}
                    onStartLesson={(lessonIndex) => setActiveLesson(lessonIndex)}
                    onTakeQuiz={(chapter) => setQuizForChapter(chapter)}
                    themeMode={themeMode}
                    setThemeMode={setThemeMode}
                    customForms={customForms}
                />
            </main>

            {editingSectionKey && landingPageData && (
                <Suspense fallback={<ModalLoader />}>
                    <EditModal
                        sectionKey={editingSectionKey}
                        pageData={landingPageData}
                        images={images}
                        basePrompt={prompt}
                        tone={tone}
                        palette={palette}
                        onClose={handleCloseEditModal}
                        onSave={handleSaveSection}
                        mediaLibrary={userMediaFiles}
                        onUploadFile={async (file) => {
                            await storageService.uploadAndAnalyzeFile(session.user.id, file);
                            await refreshAllData();
                        }}
                        allProducts={managedProducts}
                        customForms={customForms}
                        userId={session.user.id}
                        allSections={sectionOrder}
                        allPages={managedPages.map(p => ({id: p.id, name: p.name}))}
                    />
                </Suspense>
            )}

            {isDashboardOpen && (
                <Suspense fallback={<ModalLoader />}>
                    <DashboardModal
                        isOpen={isDashboardOpen}
                        onClose={() => setDashboardOpen(false)}
                        onSelectPage={(pageId) => loadPageById(pageId, managedPages)}
                        onCreateNewPage={handleCreateNewPage}
                        session={session}
                        initialTab={initialDashboardTab}
                        onOpened={() => setInitialDashboardTab(undefined)}
                        themeMode={themeMode}
                        setThemeMode={setThemeMode}
                        isLoadingPages={isPagesLoading}
                        pages={managedPages}
                        orders={managedOrders}
                        contacts={crmContacts}
                        groups={pageGroups}
                        contactList={contactList}
                        products={managedProducts}
                        categories={productCategories}
                        media={userMediaFiles}
                        team={teamMembers}
                        wizards={onboardingWizards}
                        customForms={customForms}
                        proofingRequests={proofingRequests}
                        bookings={managedBookings}
                        seoReports={seoReports}
                        onRefresh={refreshAllData}
                    />
                </Suspense>
            )}

            {isSeoModalOpen && landingPageData && (
                <Suspense fallback={<ModalLoader />}>
                    <SEOModal
                        isOpen={isSeoModalOpen}
                        onClose={() => setSeoModalOpen(false)}
                        seoData={landingPageData.seo}
                        onSave={handleSaveSeo}
                        pageData={landingPageData}
                        mediaLibrary={userMediaFiles}
                        onUploadFile={async (file) => {
                            await storageService.uploadAndAnalyzeFile(session.user.id, file);
                            await refreshAllData();
                        }}
                    />
                </Suspense>
            )}
            
            {isPublishModalOpen && activePage && (
                 <Suspense fallback={<ModalLoader />}>
                     <PublishModal
                        isOpen={isPublishModalOpen}
                        onClose={() => setPublishModalOpen(false)}
                        page={activePage}
                        pageData={landingPageData}
                        images={images}
                        onUpdate={refreshAllData}
                    />
                 </Suspense>
            )}

            {isAppSettingsModalOpen && activePage && landingPageData && (
                 <Suspense fallback={<ModalLoader />}>
                     <AppSettingsModal
                        isOpen={isAppSettingsModalOpen}
                        onClose={() => setAppSettingsModalOpen(false)}
                        pageId={activePage.id}
                        cartSettings={landingPageData.cartSettings}
                        bookingSettings={landingPageData.bookingSettings}
                        stripeSettings={landingPageData.stripeSettings}
                        headScripts={landingPageData.headScripts}
                        bodyScripts={landingPageData.bodyScripts}
                        onSave={handleSaveAppSettings}
                    />
                 </Suspense>
            )}

            {landingPageData && (
                <Suspense fallback={<ModalLoader />}>
                    <CartModal
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                        cartItems={cartItems}
                        theme={landingPageData.theme}
                        onUpdateQuantity={handleUpdateCartQuantity}
                        onRemoveItem={handleRemoveFromCart}
                        onCheckout={handleCheckout}
                        images={images}
                    />
                    <CheckoutModal
                        isOpen={isCheckoutOpen}
                        onClose={() => setIsCheckoutOpen(false)}
                        pageId={activePage?.id}
                        cartItems={cartItems}
                        theme={landingPageData.theme}
                        settings={landingPageData.cartSettings}
                        onSuccess={handleCheckoutSuccess}
                    />
                    {activePage && <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} page={activePage} services={managedProducts.filter(p => p.fulfillment_type === 'On-site Service')} />}
                </Suspense>
            )}
            {isCustomerPortalOpen && landingPageData && (
                <Suspense fallback={<ModalLoader />}>
                    <CustomerPortalModal
                        isOpen={isCustomerPortalOpen}
                        onClose={() => setIsCustomerPortalOpen(false)}
                        pageData={landingPageData}
                        onGoToCourse={() => {
                            setHasCourseAccess(true); // Simulate access
                            setIsCustomerPortalOpen(false);
                            document.getElementById('course')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    />
                </Suspense>
            )}
            {activeLesson !== null && landingPageData?.course && activePage && (
                <Suspense fallback={<ModalLoader />}>
                    <LessonViewerModal
                        course={landingPageData.course}
                        theme={landingPageData.theme}
                        images={images}
                        initialLessonIndex={activeLesson}
                        progress={courseProgress}
                        onClose={() => setActiveLesson(null)}
                        onCompleteLesson={(lessonId) => setCourseProgress(prev => ({...prev, [lessonId]: 'completed'}))}
                        onNavigate={setActiveLesson}
                        pageId={activePage.id}
                        userId={session.user.id}
                    />
                </Suspense>
            )}
            {quizForChapter && landingPageData && activePage && (
                <Suspense fallback={<ModalLoader />}>
                    <QuizModal
                        isOpen={!!quizForChapter}
                        onClose={() => setQuizForChapter(null)}
                        chapter={quizForChapter}
                        theme={landingPageData.theme}
                        onQuizPassed={() => {
                            setCourseProgress(prev => ({...prev, [(quizForChapter as any).id]: 'completed'}));
                            setQuizForChapter(null);
                        }}
                        progress={courseProgress}
                        pageId={activePage.id}
                        userId={session.user.id}
                    />
                </Suspense>
            )}
            {activeWizard && (
                <Suspense fallback={<ModalLoader />}>
                    <OnboardingWizardModal
                        isOpen={!!activeWizard}
                        onClose={() => setActiveWizard(null)}
                        wizard={activeWizard}
                        onSubmit={handleWizardSubmit}
                    />
                </Suspense>
            )}
        </div>
    );
}