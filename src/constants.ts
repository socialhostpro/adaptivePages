/**
 * @file This file contains application-wide constants, such as predefined lists for UI selectors
 * and mappings for section types.
 * @description Centralizing constants makes the application easier to configure and maintain.
 */

/** An array of possible tones for the AI to use when generating content. */
export const TONES = ["Professional", "Playful", "Persuasive", "Informative", "Inspirational"];
/** An array of possible color palettes for the AI to use. */
export const PALETTES = ["Vibrant & Energetic", "Minimalist & Modern", "Corporate & Trustworthy", "Elegant & Sophisticated", "Natural & Earthy"];

/** A list of industries to help the AI tailor content. */
export const INDUSTRIES = [
    "General Business", "Software / SaaS", "Consulting", "Coaching", "E-commerce Store", "Local Service", 
    "Plumbing", "Electrician", "Landscaping", "HVAC", "Roofing", "Cleaning Services", "Tree Service", "Contractor",
    "Tutoring", "Personal Training", "Photography", "Web Design", "Legal Services", "Accounting", "Restaurant", "Doctor's Office"
];

/** Defines the primary add-on features available for a page. */
export const ECOM_FEATURES = [
    { name: "None", key: "none" },
    { name: "Shopping Cart", key: "products" },
    { name: "Booking / Calendar", key: "booking" },
    { name: "Video Paywall System", key: "course" },
];

/**
 * A categorized list of all available page sections.
 * This is used to build the section manager UI in the control panel.
 */
export const SECTION_CATEGORIES = [
    {
        name: "Core Structure",
        items: [
            { key: "footer", name: "Footer" },
        ]
    },
    {
        name: "Content & Information",
        items: [
            { key: "hero", name: "Hero Section" },
            { key: "features", name: "Features" },
            { key: "whyChooseUs", name: "Why Choose Us" },
            { key: "gallery", name: "Image Gallery" },
            { key: "video", name: "Video Showcase" },
            { key: "testimonials", name: "Testimonials" },
            { key: "faq", name: "FAQ" },
        ]
    },
    {
        name: "Monetization & Engagement",
        items: [
            { key: "course", name: "Video Course / Paywall" },
            { key: "products", name: "Products (E-commerce)" },
            { key: "pricing", name: "Pricing Plans" },
            { key: "booking", name: "Booking / Calendar" },
            { key: "contact", name: "Contact Form" },
            { key: "cta", name: "Call to Action" },
            { key: "embed", name: "Embed AI Bot" },
        ]
    }
];

/**
 * A flat map of section keys to their display names for easy lookup.
 * @type {Record<string, string>}
 */
export const SECTIONS = SECTION_CATEGORIES.reduce((acc, category) => {
    category.items.forEach(item => {
        acc[item.key as keyof typeof acc] = item.name;
    });
    return acc;
}, {} as { [key: string]: string });

/** A default prompt to show in the control panel on first load. */
export const DEFAULT_PROMPT = "";
