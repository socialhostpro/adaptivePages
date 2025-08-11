
import React, { useState, useEffect } from 'react';
import type { ManagedPage, ManagedProduct, CartItem, CourseSectionData, CourseChapter } from './src/types';
import LoaderIcon from './components/icons/LoaderIcon';
import LandingPagePreview from './components/LandingPagePreview';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import BookingModal from './components/BookingModal';
import { LessonViewerModal } from './components/LessonViewerModal';
import CustomerPortalModal from './components/CustomerPortalModal';
import * as productService from './services/productService';
import QuizModal from './components/QuizModal';

interface PublicPageViewerProps {
    isCustomDomain: boolean;
    initialPageData: ManagedPage | null;
}

const PublicPageViewer: React.FC<PublicPageViewerProps> = ({ isCustomDomain, initialPageData }) => {
    const [page] = useState<ManagedPage | null>(initialPageData);
    const [error] = useState<string | null>(!initialPageData ? 'Page not found or is not published.' : null);
    const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState(false);
    
    // E-commerce state for public view
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [allProducts, setAllProducts] = useState<ManagedProduct[]>([]);
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

    // Course state for public view
    const [hasCourseAccess, setHasCourseAccess] = useState(false);
    const [courseProgress, setCourseProgress] = useState<Record<string, 'completed'>>({});
    const [activeLesson, setActiveLesson] = useState<number | null>(null);
    const [quizForChapter, setQuizForChapter] = useState<CourseChapter | null>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('themeMode') as 'light' | 'dark';
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemIsDark ? 'dark' : 'light');
        setThemeMode(initialTheme);

        const fetchPublicProducts = async () => {
            if (page?.data?.products?.itemIds && page.data.products.itemIds.length > 0) {
                 try {
                     // This assumes you have a public-facing function to get products
                     // For now, let's assume it exists and is RLS-safe
                     const products = await productService.getProductsByIds(page.data.products.itemIds);
                     setAllProducts(products);
                 } catch (err) {
                     console.error("Could not fetch public product data", err);
                 }
            }
        };
        fetchPublicProducts();

    }, [page]);
    
    useEffect(() => {
        if (page) {
            const root = window.document.documentElement;
            root.classList.remove(themeMode === 'light' ? 'dark' : 'light');
            root.classList.add(themeMode);
            localStorage.setItem('themeMode', themeMode);
        }
    }, [themeMode, page]);

    useEffect(() => {
        if (!page?.data) return;

        const injectedElements: Element[] = [];

        // Helper function to inject scripts and other tags
        const injectTags = (htmlString: string | undefined, target: 'head' | 'body') => {
            if (!htmlString) return;

            const targetElement = target === 'head' ? document.head : document.body;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString;

            Array.from(tempDiv.children).forEach(node => {
                let newNode: HTMLElement;
                if (node.tagName.toLowerCase() === 'script') {
                    newNode = document.createElement('script');
                    // Copy attributes
                    for (let i = 0; i < node.attributes.length; i++) {
                        const attr = node.attributes[i];
                        (newNode as HTMLScriptElement).setAttribute(attr.name, attr.value);
                    }
                    // Copy content for inline scripts
                    newNode.textContent = node.textContent;
                } else {
                    // For other tags like <link>, <style>, <noscript>
                    newNode = node.cloneNode(true) as HTMLElement;
                }
                
                targetElement.appendChild(newNode);
                injectedElements.push(newNode);
            });
        };

        injectTags(page.data.headScripts, 'head');
        injectTags(page.data.bodyScripts, 'body');

        // Cleanup function to remove injected scripts when the component unmounts or page changes
        return () => {
            injectedElements.forEach(el => el.remove());
        };
    }, [page]);
    
    const handleUnlockCourse = () => {
        setHasCourseAccess(true);
    };

    // E-commerce handlers for public view
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

    // Course Handlers for public view
    const handleStartLesson = (lessonIndex: number) => setActiveLesson(lessonIndex);
    const handleCompleteLesson = (lessonId: string) => {
        setCourseProgress(prev => ({...prev, [lessonId]: 'completed'}));
    };
    
    const handleGoToCourse = () => {
        handleUnlockCourse();
        setIsCustomerPortalOpen(false);
        document.getElementById('course')?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const handleEnroll = (course: CourseSectionData) => {
        if (!page) return;
        const courseAsCartItem: CartItem = {
            id: `course_${page.id}`, // Unique ID for this course purchase
            user_id: page.userId,
            created_at: new Date().toISOString(),
            name: course.title,
            description: course.description,
            price: course.price,
            status: 'Active',
            fulfillment_type: 'VideoCourse',
            category_id: null,
            category: 'Online Courses',
            featured_image_url: page.images?.['course_banner'] || null,
            gallery_images: [],
            options: [],
            quantity: 1,
            finalPrice: course.price,
        };
        setCartItems(prev => [...prev, courseAsCartItem]);
        setIsCartOpen(true);
    };
    
    const handleCheckoutSuccess = (purchasedItems: CartItem[]) => {
        if (purchasedItems.some(item => item.fulfillment_type === 'VideoCourse')) {
            handleUnlockCourse();
        }
        setCartItems([]);
    };

    if (error || !page || !page.data) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-100 dark:bg-gray-900">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">404 - Page Not Found</h2>
                <p className="mt-2 text-md text-gray-600 dark:text-gray-400">{error || 'The page you are looking for does not exist or is not published.'}</p>
            </div>
        );
    }

    return (
        <div>
            <LandingPagePreview
                pageId={page.id}
                data={page.data}
                images={page.images || {}}
                allProducts={allProducts}
                loading={false}
                error={null}
                onRegenerateImage={() => {}} // No-op for public view
                regeneratingImages={[]}
                onAddToCart={handleAddToCart}
                cartItems={cartItems}
                setIsCartOpen={setIsCartOpen}
                onSignInClick={() => setIsCustomerPortalOpen(true)}
                onOpenBookingModal={() => setIsBookingModalOpen(true)}
                courseAccess={hasCourseAccess}
                onEnroll={handleEnroll}
                courseProgress={courseProgress}
                onStartLesson={handleStartLesson}
                onTakeQuiz={setQuizForChapter}
                themeMode={themeMode}
                setThemeMode={setThemeMode}
            />
             {page.data && (
                <>
                    <CartModal
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                        cartItems={cartItems}
                        theme={page.data.theme}
                        onUpdateQuantity={handleUpdateCartQuantity}
                        onRemoveItem={handleRemoveFromCart}
                        onCheckout={handleCheckout}
                        images={page.images || {}}
                    />
                    <CheckoutModal
                        isOpen={isCheckoutOpen}
                        onClose={() => setIsCheckoutOpen(false)}
                        pageId={page.id}
                        cartItems={cartItems}
                        theme={page.data.theme}
                        settings={page.data.cartSettings}
                        onSuccess={handleCheckoutSuccess}
                    />
                    <BookingModal
                        isOpen={isBookingModalOpen}
                        onClose={() => setIsBookingModalOpen(false)}
                        page={page}
                        services={allProducts.filter(p => p.fulfillment_type === 'On-site Service')}
                    />
                </>
            )}
            {isCustomerPortalOpen && page.data && (
                <CustomerPortalModal
                    isOpen={isCustomerPortalOpen}
                    onClose={() => setIsCustomerPortalOpen(false)}
                    pageData={page.data}
                    onGoToCourse={handleGoToCourse}
                />
            )}
            {activeLesson !== null && page.data?.course && (
                <LessonViewerModal
                    course={page.data.course}
                    theme={page.data.theme}
                    images={page.images || {}}
                    initialLessonIndex={activeLesson}
                    progress={courseProgress}
                    onClose={() => setActiveLesson(null)}
                    onCompleteLesson={handleCompleteLesson}
                    onNavigate={setActiveLesson}
                    pageId={page.id}
                    userId={page.userId}
                />
            )}
            {quizForChapter && page.data && (
                <QuizModal
                    isOpen={!!quizForChapter}
                    onClose={() => setQuizForChapter(null)}
                    chapter={quizForChapter}
                    theme={page.data.theme}
                    onQuizPassed={() => {
                        setCourseProgress(prev => ({...prev, [quizForChapter.id]: 'completed'}));
                        setQuizForChapter(null);
                    }}
                    progress={courseProgress}
                    pageId={page.id}
                    userId={page.userId}
                />
            )}
        </div>
    );
};

export default PublicPageViewer;
