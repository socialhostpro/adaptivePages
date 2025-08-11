/**
 * @file This file contains the JSON schema definitions used to instruct the Gemini API
 * on the expected format of its responses.
 */

import { Type } from "@google/genai";
import type { Json } from '../database.types';

/**
 * The JSON schema for a generated SEO report.
 */
export const SEO_REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "An overall SEO score from 0 to 100 based on the analysis." },
    titleFeedback: { type: Type.STRING, description: "Specific feedback on the page's title tag, including length and keyword usage." },
    metaDescriptionFeedback: { type: Type.STRING, description: "Specific feedback on the meta description, including length, clarity, and call-to-action." },
    contentFeedback: { type: Type.STRING, description: "Feedback on the main content, such as keyword density, readability, and structure (headings)." },
    recommendations: {
      type: Type.ARRAY,
      description: "A list of 3-5 specific, actionable recommendations for improvement.",
      items: { type: Type.STRING }
    }
  },
  required: ["overallScore", "titleFeedback", "metaDescriptionFeedback", "contentFeedback", "recommendations"],
};

/**
 * A reusable schema property for section animations.
 */
const ANIMATION_PROPERTY = {
    animation: {
        type: Type.STRING,
        enum: ['none', 'fade-in-up'],
        description: "The animation style for when the section scrolls into view. 'fade-in-up' is a good default."
    }
};

/**
 * The main JSON schema for generating an entire landing page.
 */
export const LANDING_PAGE_SCHEMA: Json = {
  type: Type.OBJECT,
  properties: {
    theme: {
      type: Type.OBJECT,
      description: "Color theme for the landing page.",
      properties: {
        primaryColorName: { type: Type.STRING, description: "A Tailwind CSS color name like 'blue', 'green', 'indigo'." },
        textColorName: { type: Type.STRING, description: "A Tailwind CSS color name for text like 'gray', 'slate', 'zinc'." },
        fontFamily: { type: Type.STRING, description: "A Google Font family name (e.g., 'Inter', 'Poppins', 'Lato')." },
      },
      required: ["primaryColorName", "textColorName", "fontFamily"],
    },
    cartSettings: {
        type: Type.OBJECT,
        description: "Settings for the shopping cart.",
        properties: {
            currency: { type: Type.STRING, description: "The currency symbol to display, e.g., '$'." },
            notificationEmail: { type: Type.STRING, description: "The email address to notify for new orders." },
        },
        required: ["currency", "notificationEmail"],
    },
    bookingSettings: {
        type: Type.OBJECT,
        description: "Settings for contact forms and bookings.",
        properties: {
            notificationEmail: { type: Type.STRING, description: "The email address to notify for new contact messages." },
            webhookUrl: { type: Type.STRING, description: "Optional: A URL to which form submission data will be sent via POST request." },
            webhookApiKey: { type: Type.STRING, description: "Optional: An API key to include in the 'X-API-Key' header of the webhook request." }
        },
        required: ["notificationEmail"],
    },
    stripeSettings: {
        type: Type.OBJECT,
        description: "Settings for Stripe payment gateway.",
        properties: {
            publishableKey: { type: Type.STRING, description: "The Stripe publishable key (pk_test_... or pk_live_...)." },
            secretKey: { type: Type.STRING, description: "The Stripe secret key (sk_test_... or sk_live_...)." },
        },
        required: ["publishableKey", "secretKey"],
    },
    seo: {
      type: Type.OBJECT,
      description: "SEO metadata for the page.",
      properties: {
        title: { type: Type.STRING, description: "A concise and compelling SEO title for the browser tab and search results (under 60 characters)." },
        description: { type: Type.STRING, description: "A brief summary of the page for search engine results (meta description, around 155 characters)." },
        keywords: { type: Type.STRING, description: "A comma-separated list of relevant keywords for SEO." },
        schemaSnippet: { type: Type.STRING, description: "Optional: A JSON-LD schema snippet for advanced SEO. Must be a valid JSON string." },
        ogImagePrompt: { type: Type.STRING, description: "A detailed prompt for a social media sharing image (og:image). Should be visually appealing and landscape-oriented (16:9 aspect ratio)." },
        metaTags: {
          type: Type.ARRAY,
          description: "Optional: Additional meta tags, e.g., for social media (og:title).",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The 'name' or 'property' attribute of the meta tag." },
              content: { type: Type.STRING, description: "The 'content' attribute of the meta tag." }
            },
            required: ['name', 'content']
          }
        }
      },
      required: ["title", "description", "keywords"],
    },
    nav: {
      type: Type.OBJECT,
      description: "Navigation bar configuration.",
      properties: {
        logoType: { type: Type.STRING, enum: ['text', 'image'], description: "Type of logo to use." },
        logoText: { type: Type.STRING, description: "The text for the logo. Used if logoType is 'text'." },
        logoImagePrompt: { type: Type.STRING, description: "An image prompt for an AI to generate a logo. Used if logoType is 'image'." },
        logoWidth: { type: Type.NUMBER, description: "The width of the logo in pixels, e.g., 140." },
        navStyle: { type: Type.STRING, enum: ['sticky', 'static'], description: "The scrolling behavior of the navigation bar." },
        navTransparency: { type: Type.STRING, enum: ['none', 'on-hero'], description: "Determines if the nav is transparent over the hero. 'on-hero' is a good default." },
        layout: { type: Type.STRING, enum: ['standard', 'centered', 'split'], description: "The desktop layout of the navigation bar. 'Standard' is logo left/items right. 'Centered' is logo and items centered. 'Split' is logo center, items on far sides." },
        mobileLayout: { type: Type.STRING, enum: ['hamburger', 'bottom'], description: "The layout of the navigation bar on mobile devices." },
        signInButtonEnabled: { type: Type.BOOLEAN, description: "Whether to show a 'Sign In' or 'My Account' button." },
        signInButtonText: { type: Type.STRING, description: "The text for the sign in button, e.g., 'Sign In' or 'My Portal'." },
        cartButtonEnabled: { type: Type.BOOLEAN, description: "Whether to show the shopping cart icon." },
        menuItems: {
            type: Type.ARRAY,
            description: "A list of navigation menu items.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "The display text for the menu item." },
                    link: { type: Type.STRING, description: "The URL or anchor link for the menu item (e.g., '#features')." },
                    iconName: { type: Type.STRING, description: "A Lucide icon name, especially for the mobile 'bottom' layout (e.g., 'Home', 'AppWindow', 'MessageSquare')." }
                },
                required: ['text', 'link']
            }
        }
      },
      required: ["logoType", "logoText", "logoWidth", "navStyle", "navTransparency", "layout", "mobileLayout", "menuItems", "signInButtonEnabled", "signInButtonText", "cartButtonEnabled"],
    },
    sectionOrder: {
        type: Type.ARRAY,
        description: "The order in which the sections should appear on the page.",
        items: { type: Type.STRING }
    },
    hero: {
      type: Type.OBJECT,
      description: "The main hero section. Can have a full-width background (image, video, slider), a split-column layout, or a background with a form overlay.",
      properties: {
        layout: { type: Type.STRING, enum: ['background', 'split', 'form_overlay', 'split_embed', 'split_video', 'embed_overlay'], description: "Layout for the hero. 'split' is text/image. 'split_video' is text/video. 'split_embed' is text/embed code on a plain background. 'embed_overlay' is a media background with a text/embed split on top." },
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        buttons: {
            type: Type.ARRAY,
            description: "A list of call-to-action buttons.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    link: { type: Type.STRING },
                    style: { type: Type.STRING, enum: ['primary', 'secondary', 'outline'] },
                },
                required: ['text', 'link', 'style']
            }
        },
        buttonLayout: { type: Type.STRING, enum: ['horizontal', 'vertical'], description: "How the CTA buttons should be arranged." },
        backgroundType: { type: Type.STRING, enum: ['image', 'video', 'slider'], description: "Type of background media for 'background' and 'form_overlay' layouts." },
        imagePrompt: { type: Type.STRING, description: "Prompt for the main background image if backgroundType is 'image'." },
        videoSource: { type: Type.STRING, enum: ['youtube'], description: "The source for the background video." },
        youtubeVideoId: { type: Type.STRING, description: "YouTube video ID for background video." },
        backgroundVideoEmbedCode: { type: Type.STRING, description: "Full HTML embed code for a background video from a source other than YouTube." },
        splitImagePrompt: { type: Type.STRING, description: "Prompt for the image in a 'split' layout." },
        splitVideoSource: { type: Type.STRING, enum: ['youtube'], description: "The source for the split-screen video." },
        splitYoutubeVideoId: { type: Type.STRING, description: "YouTube video ID for the 'split_video' layout." },
        splitVideoEmbedCode: { type: Type.STRING, description: "Full HTML embed code for a video in a 'split_video' layout." },
        splitEmbedCode: { type: Type.STRING, description: "HTML embed code for the 'split_embed' layout." },
        splitEmbedWidth: { type: Type.STRING, description: "The width for the embedded content, e.g., '100%' or '600px'. Defaults to '100%'." },
        splitEmbedHeight: { type: Type.STRING, description: "The height for the embedded content, e.g., '450px'. Defaults to '450px'." },
        slides: {
          type: Type.ARRAY,
          description: "An array of 3-5 slides, each with its own title, subtitle, and image prompt. Used only when backgroundType is 'slider'.",
          items: {
              type: Type.OBJECT,
              properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING }
              },
              required: ['title', 'subtitle', 'imagePrompt']
          }
        },
        animateText: { type: Type.BOOLEAN, description: "If true and backgroundType is 'slider', text for each slide will animate. Otherwise, a single static text is shown." },
        formId: { type: Type.STRING, description: "The ID of a reusable custom form to display. Only used when layout is 'form_overlay'." },
        formTitle: { type: Type.STRING, description: "The title for the form in the 'form_overlay' layout. Overrides the name of a reusable form if 'formId' is also used." },
        fields: {
          type: Type.ARRAY,
          description: "Custom form fields for an embedded form. If provided, 'formId' is ignored. Only for 'form_overlay' layout.",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "A unique identifier for the field, e.g. 'field-1'."},
              label: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['text', 'email', 'textarea', 'tel'] },
              required: { type: Type.BOOLEAN }
            },
            required: ['id', 'label', 'type', 'required']
          }
        },
        ...ANIMATION_PROPERTY,
      },
      required: ["layout", "title", "subtitle", "buttons", "buttonLayout", "backgroundType"]
    },
    features: {
      type: Type.OBJECT,
      description: "A section highlighting key features, benefits, or services, typically with icons.",
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              iconName: { type: Type.STRING, description: "A relevant icon name from the Lucide icon library (e.g., 'Zap', 'ShieldCheck')." },
              name: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['iconName', 'name', 'description']
          }
        },
        ...ANIMATION_PROPERTY,
      },
      required: ["title", "subtitle", "items"]
    },
    whyChooseUs: {
        type: Type.OBJECT,
        description: "A section explaining why a customer should choose this product or service.",
        properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        iconName: { type: Type.STRING, description: "A relevant icon name from the Lucide icon library (e.g., 'Award', 'Users', 'ThumbsUp')." },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ['iconName', 'title', 'description']
                }
            },
            ...ANIMATION_PROPERTY,
        },
        required: ["title", "subtitle", "items"]
    },
    gallery: {
        type: Type.OBJECT,
        description: "A grid-based image gallery.",
        properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        imagePrompt: { type: Type.STRING, description: "A detailed prompt for an AI image generator or a public URL to an existing image." },
                        altText: { type: Type.STRING, description: "Descriptive alt text for the image for SEO and accessibility." }
                    },
                    required: ['imagePrompt', 'altText']
                }
            },
            ...ANIMATION_PROPERTY,
        },
        required: ["title", "subtitle", "items"]
    },
    products: {
        type: Type.OBJECT,
        description: "A section to display e-commerce products or services.",
        properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                description: "An array of product or service items to generate.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        price: { type: Type.NUMBER },
                        status: { type: Type.STRING, enum: ['Active', 'Draft', 'Archived'] },
                        fulfillment_type: { type: Type.STRING, enum: ['Shippable', 'Digital', 'On-site Service', 'VideoCourse'] },
                        category: { type: Type.STRING, description: "The product category. Must be one of the provided category names." },
                        featured_image_url: { type: Type.STRING, description: "A detailed prompt for the main product image." },
                        gallery_images: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of detailed prompts for additional gallery images." },
                        options: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    values: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                value: { type: Type.STRING },
                                                priceModifier: { type: Type.NUMBER, description: "A positive or negative value to add to the base price." }
                                            },
                                             required: ['value', 'priceModifier']
                                        }
                                    }
                                },
                                required: ['name', 'values']
                            }
                        }
                    },
                    required: ['name', 'description', 'price', 'status', 'fulfillment_type', 'category', 'featured_image_url']
                }
            },
            ...ANIMATION_PROPERTY,
        },
        required: ["title", "subtitle", "items"]
    },
    course: {
        type: Type.OBJECT,
        description: "A full section for an online video course, including chapters and lessons.",
        properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            description: { type: Type.STRING },
            mediaType: { type: Type.STRING, enum: ['image', 'video'] },
            imagePrompt: { type: Type.STRING },
            videoSource: { type: Type.STRING, enum: ['youtube'] },
            youtubeVideoId: { type: Type.STRING },
            price: { type: Type.NUMBER },
            currency: { type: Type.STRING, description: "e.g. '$'" },
            buyButtonText: { type: Type.STRING },
            certificateEnabled: { type: Type.BOOLEAN },
            certificateTitle: { type: Type.STRING },
            courseProviderName: { type: Type.STRING },
            backgroundColor: { type: Type.STRING, description: "A subtle Tailwind CSS background color class for light mode (e.g., 'slate-100')." },
            darkBackgroundColor: { type: Type.STRING, description: "A subtle Tailwind CSS background color class for dark mode (e.g., 'slate-800')." },
            enforceSequence: { type: Type.BOOLEAN, description: "If true, users must complete lessons in order." },
            chapters: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "A unique identifier for the chapter, e.g., 'c-1'." },
                        title: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        quiz: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                questions: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            id: { type: Type.STRING, description: "A unique identifier for the question, e.g., 'q-1-1'." },
                                            text: { type: Type.STRING },
                                            options: {
                                                type: Type.ARRAY,
                                                items: {
                                                    type: Type.OBJECT,
                                                    properties: {
                                                        id: { type: Type.STRING, description: "A unique identifier for the option, e.g., 'o-1-1-1'." },
                                                        text: { type: Type.STRING },
                                                    },
                                                    required: ['id', 'text']
                                                }
                                            },
                                            correctOptionId: { type: Type.STRING }
                                        },
                                        required: ['id', 'text', 'options', 'correctOptionId']
                                    }
                                }
                            },
                            required: ['title', 'questions']
                        },
                        lessons: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING, description: "A unique identifier for the lesson, e.g., 'l-1-1'." },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    videoSource: { type: Type.STRING, enum: ['youtube', 'embed'] },
                                    youtubeVideoId: { type: Type.STRING },
                                    videoEmbedCode: { type: Type.STRING },
                                    duration: { type: Type.STRING, description: "Video duration in 'mm:ss' format." },
                                    isFreePreview: { type: Type.BOOLEAN },
                                    worksheetUrl: { type: Type.STRING, description: "Leave this empty." },
                                    imagePrompt: { type: Type.STRING, description: "A prompt for a small thumbnail image for the lesson." }
                                },
                                required: ['id', 'title', 'description', 'duration', 'isFreePreview']
                            }
                        }
                    },
                    required: ['id', 'title', 'lessons']
                }
            },
            ...ANIMATION_PROPERTY,
        },
        required: ["title", "subtitle", "description", "mediaType", "chapters", "price", "currency", "buyButtonText", "certificateEnabled", "courseProviderName", "enforceSequence"]
    },
    video: {
      type: Type.OBJECT,
      description: "A section to feature a single video.",
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        videoSource: { type: Type.STRING, enum: ['youtube'], description: "The source of the video." },
        youtubeVideoId: { type: Type.STRING, description: "A YouTube video ID." },
        videoEmbedCode: { type: Type.STRING, description: "Full HTML embed code for a video from another source." },
        ...ANIMATION_PROPERTY,
      },
      required: ["title", "subtitle", "videoSource"]
    },
    testimonials: {
      type: Type.OBJECT,
      description: "A section to display customer testimonials, usually with avatars.",
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              quote: { type: Type.STRING },
              author: { type: Type.STRING },
              role: { type: Type.STRING },
              avatarImagePrompt: { type: Type.STRING, description: "A prompt for an AI to generate an avatar image." }
            },
            required: ['quote', 'author', 'role', 'avatarImagePrompt']
          }
        },
        ...ANIMATION_PROPERTY,
      },
      required: ["title", "subtitle", "items"]
    },
    pricing: {
      type: Type.OBJECT,
      description: "A section with pricing plans.",
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        plans: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              price: { type: Type.STRING, description: "e.g., '$29/mo' or 'Free'" },
              features: { type: Type.ARRAY, items: { type: Type.STRING } },
              isFeatured: { type: Type.BOOLEAN, description: "Whether this plan should be visually highlighted." },
              ctaText: { type: Type.STRING },
              ctaLink: { type: Type.STRING }
            },
            required: ['name', 'price', 'features', 'isFeatured', 'ctaText', 'ctaLink']
          }
        },
        ...ANIMATION_PROPERTY,
      },
      required: ["title", "subtitle", "plans"]
    },
    faq: {
      type: Type.OBJECT,
      description: "A Frequently Asked Questions section, often in an accordion style.",
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ['question', 'answer']
          }
        },
        ...ANIMATION_PROPERTY,
      },
      required: ["title", "subtitle", "items"]
    },
    contact: {
        type: Type.OBJECT,
        description: "A simple contact form section.",
        properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            ...ANIMATION_PROPERTY,
        },
        required: ["title", "subtitle"]
    },
    customForm: {
        type: Type.OBJECT,
        description: "A section that displays a custom-built form.",
        properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            formId: { type: Type.STRING, description: "The ID of the custom form to display." },
            ...ANIMATION_PROPERTY,
        },
        required: ["title", "subtitle", "formId"]
    },
    embed: {
      type: Type.OBJECT,
      description: "An AI Chatbot section that can be embedded as a floating button or inline.",
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        embedType: { type: Type.STRING, enum: ['floating-script', 'inline-iframe'] },
        embedCode: { type: Type.STRING, description: "The full script or iframe code. Use '[api_key]' as a placeholder for the API key." },
        apiKey: { type: Type.STRING, description: "The API key for the bot, which will replace the '[api_key]' placeholder." },
        ...ANIMATION_PROPERTY,
      },
      required: ["title", "subtitle", "embedType", "embedCode", "apiKey"]
    },
    booking: {
        type: Type.OBJECT,
        description: "A booking section with an embedded calendar (e.g., Calendly).",
        properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            ctaText: { type: Type.STRING },
            bookingEmbedCode: { type: Type.STRING, description: "The full HTML embed code from a service like Calendly." },
            ...ANIMATION_PROPERTY,
        },
        required: ["title", "subtitle", "ctaText", "bookingEmbedCode"]
    },
    cta: {
      type: Type.OBJECT,
      description: "A Call To Action section, usually with a strong headline and a single button.",
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        ctaText: { type: Type.STRING },
        ctaLink: { type: Type.STRING },
        ...ANIMATION_PROPERTY,
      },
      required: ["title", "subtitle", "ctaText", "ctaLink"]
    },
    footer: {
      type: Type.OBJECT,
      description: "The footer section of the page.",
      properties: {
        copyrightText: { type: Type.STRING },
        socialLinks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              network: { type: Type.STRING, enum: ['twitter', 'linkedin', 'github', 'facebook', 'instagram'] },
              url: { type: Type.STRING }
            },
            required: ['network', 'url']
          }
        }
      },
      required: ["copyrightText", "socialLinks"]
    }
  },
  required: ["theme", "seo", "nav", "sectionOrder", "cartSettings", "bookingSettings", "stripeSettings"]
};