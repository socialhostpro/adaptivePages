/**
 * @file Contains shared, common, and miscellaneous type definitions used across multiple features.
 */

import type { Json } from '../../database.types';

/** Represents a single menu item in the navigation bar. */
export interface NavMenuItem {
  text: string;
  link: string;
  iconName?: string;
}

/** Represents a single slide in a hero section carousel. */
export interface HeroSlide {
  title: string;
  subtitle: string;
  imagePrompt: string;
}

/** Represents a call-to-action button in the hero section. */
export interface HeroButton {
    text: string;
    link: string;
    style: 'primary' | 'secondary' | 'outline';
}

/** Represents a single feature item, typically with an icon. */
export interface FeatureItem {
  iconName: string;
  name: string;
  description: string;
}

/** Represents a single testimonial. */
export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  avatarImagePrompt: string;
}

/** Represents a single pricing plan. */
export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  isFeatured: boolean;
  ctaText: string;
  ctaLink: string;
}

/** Represents a single FAQ item (question and answer). */
export interface FAQItem {
  question: string;
  answer: string;
}

/** Represents a single item for the 'Why Choose Us' section. */
export interface WhyChooseUsItem {
    iconName: string;
    title: string;
    description: string;
}

/** Represents a single image in the gallery. */
export interface GalleryItem {
    imagePrompt: string;
    altText: string;
}

/** Represents a link to a social media network. */
export interface SocialLink {
    network: 'twitter' | 'linkedin' | 'github' | 'facebook' | 'instagram';
    url: string;
}

/** Represents a single lesson within a course chapter. */
export interface CourseLesson {
    id: string;
    title: string;
    description: string;
    videoSource: 'youtube' | 'embed';
    youtubeVideoId?: string;
    videoEmbedCode?: string;
    duration: string; // "e.g., 10:35"
    isFreePreview: boolean;
    worksheetUrl?: string; // PDF URL from media library
    imagePrompt?: string; // Optional thumbnail for the lesson
}

/** Represents a single question option in a quiz. */
export interface QuizOption {
    id: string;
    text: string;
}

/** Represents a single question in a quiz. */
export interface QuizQuestion {
    id: string;
    text: string;
    options: QuizOption[];
    correctOptionId: string;
}

/** Represents a quiz associated with a course chapter. */
export interface Quiz {
    title: string;
    questions: QuizQuestion[];
}

/** Represents a single chapter within a course. */
export interface CourseChapter {
    id: string;
    title: string;
    lessons: CourseLesson[];
    imagePrompt?: string; // Optional banner image for the chapter
    quiz?: Quiz;
}

/** Represents a message submitted through the contact form. */
export interface ContactMessage {
    pageId: string;
    firstName: string;
    lastName: string;
    email: string;
    message: string;
}

/** Defines the theme settings for a landing page. */
export interface LandingPageTheme {
  primaryColorName: string;
  textColorName: string;
  fontFamily: string;
}

/** Defines the settings for the shopping cart. */
export interface CartSettings {
    currency: string;
    notificationEmail: string;
}

/** Defines the settings for contact forms and simple bookings. */
export interface BookingSettings {
    notificationEmail: string;
    webhookUrl?: string;
    webhookApiKey?: string;
}

/** Defines Stripe API key settings. */
export interface StripeSettings {
  publishableKey: string;
  secretKey: string;
}

/** Represents global settings for a user account. */
export interface UserSettings {
    id: string; // matches user_id
    updated_at?: string;
    elevenlabs_api_key?: string | null;
    elevenlabs_webhook_url?: string | null;
    google_api_key?: string | null;
    google_build_config?: Json | null;
    default_custom_domain?: string | null;
    twilio_account_sid?: string | null;
    twilio_auth_token?: string | null;
    twilio_from_number?: string | null;
    sendgrid_api_key?: string | null;
    sendgrid_from_email?: string | null;
}