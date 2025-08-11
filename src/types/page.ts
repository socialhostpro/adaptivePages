/**
 * @file Contains type definitions related to the core page structure and management.
 */

import type { LandingPageTheme, CartSettings, BookingSettings, StripeSettings } from './shared';
import type { SEOData } from './seo';
import type { BookingSystemSettings } from './booking';
import type { 
    HeroSectionData, FeaturesSectionData, VideoSectionData, TestimonialsSectionData, PricingSectionData, 
    FAQSectionData, ContactSectionData, BookingSectionData, WhyChooseUsSectionData, GallerySectionData, 
    ProductsSectionData, CourseSectionData, CustomFormSectionData, EmbedSectionData, FooterSectionData, 
    CTASectionData, NavSectionData 
} from './sections';


/**
 * Represents the entire data structure for a generated landing page.
 * @interface
 */
export interface LandingPageData {
  /** The visual theme of the page, including colors and fonts. */
  theme: LandingPageTheme;
  /** SEO metadata for the page. */
  seo: SEOData;
  /** Configuration for the navigation bar. */
  nav: NavSectionData;
  /** The ordered list of section keys determining the layout of the page. */
  sectionOrder: string[];
  /** Settings related to the shopping cart functionality. */
  cartSettings: CartSettings;
  /** Settings for contact forms and simple bookings. */
  bookingSettings: BookingSettings;
  /** Settings for the standalone public booking system. */
  bookingSystemSettings?: BookingSystemSettings;
  /** Stripe API keys for payment processing. */
  stripeSettings: StripeSettings;
  /** Optional data for the hero section. */
  hero?: HeroSectionData;
  /** Optional data for the features section. */
  features?: FeaturesSectionData;
  /** Optional data for the video section. */
  video?: VideoSectionData;
  /** Optional data for the testimonials section. */
  testimonials?: TestimonialsSectionData;
  /** Optional data for the pricing section. */
  pricing?: PricingSectionData;
  /** Optional data for the FAQ section. */
  faq?: FAQSectionData;
  /** Optional data for the contact section. */
  contact?: ContactSectionData;
  /** Optional data for the booking section. */
  booking?: BookingSectionData;
  /** Optional data for the 'Why Choose Us' section. */
  whyChooseUs?: WhyChooseUsSectionData;
  /** Optional data for the gallery section. */
  gallery?: GallerySectionData;
  /** Optional data for the products section. */
  products?: ProductsSectionData;
  /** Optional data for the course section. */
  course?: CourseSectionData;
  /** Optional data for a custom form section. */
  customForm?: CustomFormSectionData;
  /** Optional data for an embeddable content section. */
  embed?: EmbedSectionData;
  /** Optional data for the footer section. */
  footer?: FooterSectionData;
  /** Optional data for a call-to-action section. */
  cta?: CTASectionData;
  /** Flag to enable the staff portal. */
  staffPortalEnabled?: boolean;
  /** Custom scripts to be injected into the `<head>` of the page. */
  headScripts?: string;
  /** Custom scripts to be injected at the end of the `<body>` of the page. */
  bodyScripts?: string;
}

/**
 * Represents a mapping of image keys (like 'hero', 'logo') to their source URL or base64 string.
 * @interface
 */
export interface ImageStore {
  [key: string]: string;
}

/**
 * Represents the configuration used to generate a page.
 * @interface
 */
export interface GenerationConfig {
  /** The main text prompt from the user. */
  prompt: string;
  /** The desired tone for the page copy. */
  tone: string;
  /** The desired color palette for the page design. */
  palette: string;
  /** The industry focus for the page content. */
  industry: string;
  /** Optional URL of an old site to scrape for content. */
  oldSiteUrl?: string;
  /** Optional URL of a site to use for design inspiration. */
  inspirationUrl?: string;
}

/**
 * Represents a page as it is managed within the application dashboard.
 * @interface
 */
export interface ManagedPage {
  /** The unique identifier (UUID) for the page. */
  id: string;
  /** The ID of the user who owns the page. */
  userId: string;
  /** The user-defined name of the page. */
  name: string;
  /** The timestamp of the last update. */
  updatedAt: string;
  /** The URL of the page's thumbnail image. */
  thumbnailUrl?: string;
  /** The editable, working data for the page. */
  data: LandingPageData | null;
  /** The store of images for the working version of the page. */
  images: ImageStore;
  /** Flag indicating if the page is currently published. */
  isPublished: boolean;
  /** The URL-friendly slug for the public page. */
  slug: string | null;
  /** The custom domain associated with the page. */
  customDomain: string | null;
  /** The configuration settings used to generate the page. */
  generationConfig?: GenerationConfig | null;
  /** The data for the published version of the page. */
  publishedData?: LandingPageData | null;
  /** The store of images for the published version of the page. */
  publishedImages?: ImageStore | null;
  /** The ID of the group this page belongs to. */
  groupId?: string | null;
  /** The name of the group this page belongs to (for display). */
  groupName?: string | null;
  /** The ID of the contact who owns this page (for client management). */
  ownerContactId?: number | null;
  /** The name of the contact who owns this page (for display). */
  ownerName?: string | null;
}

/**
 * Represents a group used to organize pages.
 * @interface
 */
export interface PageGroup {
  /** The unique identifier (UUID) for the group. */
  id: string;
  /** The ID of the user who owns the group. */
  user_id: string;
  /** The name of the group. */
  name: string;
}
