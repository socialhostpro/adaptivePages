


export const TONES = ["Professional", "Playful", "Persuasive", "Informative", "Inspirational"];
export const PALETTES = ["Vibrant & Energetic", "Minimalist & Modern", "Corporate & Trustworthy", "Elegant & Sophisticated", "Natural & Earthy"];

export const INDUSTRIES = [
    "General Business", "Software / SaaS", "Consulting", "Coaching", "E-commerce Store", "Local Service", 
    "Plumbing", "Electrician", "Landscaping", "HVAC", "Roofing", "Cleaning Services", "Tree Service", "Contractor",
    "Tutoring", "Personal Training", "Photography", "Web Design", "Legal Services", "Accounting", "Restaurant", "Doctor's Office"
];

export const ECOM_FEATURES = [
    { name: "None", key: "none" },
    { name: "Shopping Cart", key: "products" },
    { name: "Booking / Calendar", key: "booking" },
    { name: "Video Paywall System", key: "course" },
];


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


// Create a flat SECTIONS object from the categories for easier lookup elsewhere
export const SECTIONS = SECTION_CATEGORIES.reduce((acc, category) => {
    category.items.forEach(item => {
        acc[item.key as keyof typeof acc] = item.name;
    });
    return acc;
}, {} as { [key: string]: string });


export const DEFAULT_PROMPT = "A landing page for a new AI-powered yoga app called 'ZenFlow'. It helps users create personalized yoga routines.";