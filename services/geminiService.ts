


import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { LANDING_PAGE_SCHEMA, MediaFile, ProductCategory, ManagedProduct, SEOData, SiteComponent, Veo3Prompt, SEO_REPORT_SCHEMA } from '../types';
import type { LandingPageData } from '../types';

// Get API key from environment variables (Vite format)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.API_KEY || import.meta.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  console.warn("Gemini API key not found in environment variables. AI features will be disabled.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to build a tree and then format it for the prompt
const formatCategoryTreeForPrompt = (categories: ProductCategory[]): string => {
    if (!categories || categories.length === 0) return 'No categories available.';
    
    const map = new Map(categories.map(c => [c.id, { ...c, children: [] as ProductCategory[] }]));
    const roots: ProductCategory[] = [];
    
    categories.forEach(c => {
        const node = map.get(c.id)!;
        if (c.parent_id && map.has(c.parent_id)) {
            map.get(c.parent_id)!.children.push(node);
        } else {
            roots.push(node);
        }
    });

    const buildString = (nodes: ProductCategory[], prefix = ''): string => {
        let str = '';
        nodes.forEach((node, index) => {
            const isLast = index === nodes.length - 1;
            str += `${prefix}${isLast ? '└── ' : '├── '}${node.name}\n`;
            if (node.children.length > 0) {
                str += buildString(node.children, `${prefix}${isLast ? '    ' : '│   '}`);
            }
        });
        return str;
    };
    
    return buildString(roots);
};

const handleGeminiError = (error: unknown, context: string): Error => {
    const err = error as Error;
    console.error(`Error in ${context}:`, err.message, err);
    if (err.message.includes("Model isn't available")) {
        return new Error("The AI model is currently busy or unavailable. Please wait a moment and try again.");
    }
    if (err.message.includes("API key not valid")) {
        return new Error("The configured API key is not valid. Please check your settings.");
    }
    return new Error(`An unexpected error occurred with the AI service during ${context}. Details: ${err.message}`);
};


export async function generateLandingPageStructure(
  prompt: string,
  tone: string,
  palette: string,
  sections: string[],
  industry: string,
  mediaLibrary?: MediaFile[],
  categories?: ProductCategory[],
  products?: ManagedProduct[],
  components?: SiteComponent[],
  oldSiteUrl?: string,
  inspirationUrl?: string
): Promise<LandingPageData> {
  const selectedSections = { ...LANDING_PAGE_SCHEMA.properties };
  
  // Filter schema to only include selected sections
  const schemaProperties = Object.keys(selectedSections).reduce((acc, key) => {
    if (['theme', 'nav', 'seo', 'sectionOrder', 'cartSettings', 'bookingSettings', 'stripeSettings'].includes(key) || sections.includes(key)) {
      acc[key] = (selectedSections as any)[key];
    }
    return acc;
  }, {} as Record<string, any>);

  const requiredFields = ["theme", "nav", "seo", "sectionOrder", "cartSettings", "bookingSettings", "stripeSettings", ...sections.filter(s => schemaProperties[s])];
  
  const dynamicSchema = {
    type: Type.OBJECT,
    properties: JSON.parse(JSON.stringify(schemaProperties)), // Deep copy to avoid mutation
    required: requiredFields
  };

  const useSearch = oldSiteUrl || inspirationUrl;

  // The AI will still use names, but we provide the hierarchy for context.
  if (dynamicSchema.properties.products && categories && categories.length > 0) {
      const categoryNames = categories.map(c => c.name);
      if (categoryNames.length > 0) {
         dynamicSchema.properties.products.properties.items.properties.category.enum = categoryNames;
      }
  }

  const componentLibraryInfo = components && components.length > 0
    ? `
    The user has a library of pre-built page components. When generating a section, if a component from this library is a good fit for the user's prompt, you should use its data structure directly. You can identify suitable components by their name, section_type, keywords, and tags. Do NOT use a component if it's not a good fit for the overall page concept.
    
    USER COMPONENT LIBRARY (JSON):
    ${JSON.stringify(components.map(c => ({ name: c.name, section_type: c.section_type, keywords: c.keywords, tags: c.tags, data: c.data })))}
    `
    : '';

  const mediaLibraryInfo = mediaLibrary && mediaLibrary.length > 0
    ? `
    The user has provided a media library (their "Stock" photos/videos). Before generating a new image prompt for any image field (like 'imagePrompt', 'featured_image_url', 'gallery_images'), you MUST first check if a suitable image exists in the library. If a good match is found based on its description and keywords, use the image's "url" value directly in the JSON output for that field. If no good match is found, then proceed to generate a new, detailed prompt as usual.
    
    USER MEDIA LIBRARY (JSON):
    ${JSON.stringify(mediaLibrary.map(f => ({ url: f.url, name: f.name, description: f.description, keywords: f.keywords })))}
    `
    : '';
    
  const categoryInfo = categories && categories.length > 0
    ? `
    The user has a predefined hierarchical list of product categories. When generating products, you MUST assign a 'category' to each product by selecting the most appropriate one from the list below. You are FORBIDDEN from creating a new category name. Pick the most specific subcategory that fits the product.

    AVAILABLE CATEGORY TREE:
    ${formatCategoryTreeForPrompt(categories)}
    `
    : `When generating products, assign a relevant category.`;
  
  const productInfo = products && products.length > 0
    ? `
    The user also has an existing library of products. If the landing page concept calls for products that already exist in this library, you should reuse them. If new products are needed, generate them.
    
    EXISTING PRODUCTS:
    ${JSON.stringify(
        products
            .filter(p => {
                if (!p) {
                    console.warn('Filtered out a null or undefined product from prompt context.');
                    return false;
                }
                if (typeof p.category !== 'string' || !p.category) {
                     console.warn(`Filtered out a product with an invalid or missing category from prompt context:`, p);
                    return false;
                }
                return true;
            })
            .map(p => ({ 
                name: p.name, 
                description: p.description, 
                category: p.category
            }))
    )}
    `
    : '';
    
    let urlInstructions = '';
    if (oldSiteUrl) {
      urlInstructions += `\n- Scrape the content from this URL to inform the new page's text and copy. Prioritize this content source: ${oldSiteUrl}`;
    }
    if (inspirationUrl) {
      urlInstructions += `\n- Analyze this URL for style, layout, color scheme, and overall design inspiration. Heavily weight this as a design reference: ${inspirationUrl}`;
    }
     if (oldSiteUrl && inspirationUrl) {
      urlInstructions += `\n- CRITICAL: Use the first URL for CONTENT and the second URL for STYLE.`;
    }

  const fullPrompt = `
    You are an expert web designer and copywriter specializing in creating high-converting landing pages.
    Your task is to generate the content and structure for a landing page based on the user's request.
    You must output your response as a single, valid JSON object that conforms to the provided schema.
    Do not include any explanatory text, markdown formatting, or anything else before or after the JSON object.
    ${useSearch ? "When analyzing URLs, if a site is complex, focus on the home/landing page content." : ""}

    ---
    USER REQUEST:
    - Concept: "${prompt}"
    - Industry Focus: "${industry}"
    - Desired Tone: "${tone}"
    - Desired Palette: "${palette}"
    - Sections to Include: ${sections.join(', ')}
    ${urlInstructions}
    ---

    INSTRUCTIONS:
    1.  Generate compelling, creative, and appropriate content for each requested section. First, check the user's component library (if provided) to see if a pre-built component is a good match. If so, use its data. Otherwise, generate new content.
    2.  For the 'seo' section: create a title (under 60 chars), a meta description (around 155 chars), keywords, a simple JSON-LD schema snippet for an Organization or Product, and a visually appealing 'ogImagePrompt' for a social media sharing image that summarizes the page's content.
    3.  For the 'nav' section: create a short, catchy logo text and menu items linking to section IDs (e.g., '#features'). For 'mobileLayout', choose 'hamburger' for >3 items, else 'bottom' (and provide iconNames). For desktop 'layout', 'standard' is a good default. If sections include 'course' or 'products', set 'signInButtonEnabled' to true and 'signInButtonText' to 'Sign In', otherwise set 'signInButtonEnabled' to false. Also, set 'cartButtonEnabled' to true if sections include 'products' or 'course', otherwise set it to false.
    4.  If a 'hero' section is requested:
        *   First, choose the most appropriate 'layout': 'background' for a standard hero, 'split' for text/image, 'form_overlay' for lead generation, 'split_video' for text/video, 'split_embed' for text/interactive content on a plain background, or 'embed_overlay' for text/interactive content over a background image/video.
        *   If 'layout' is 'background', 'form_overlay', or 'embed_overlay', choose 'backgroundType': 'image', 'video', or 'slider'.
        *   If the layout involves video, provide a YouTube video ID in the 'youtubeVideoId' fields. For other sources, you may provide a full HTML embed code in the '...EmbedCode' fields.
        *   If 'backgroundType' is 'slider', populate the 'slides' array. Decide if text is unique per slide ('animateText': true) or static ('animateText': false).
        *   If 'layout' is 'split_embed' or 'embed_overlay', provide a 'splitEmbedCode' (e.g., a Calendly or Loom iframe). Also provide 'splitEmbedWidth' (default '100%') and 'splitEmbedHeight' (default '450px').
    5.  For any OTHER image field ('featured_image_url', 'gallery_images', etc.): First, check the user's media library (if provided below). If a suitable image is found, use its public URL directly. Otherwise, create a new, detailed, artistic prompt for an AI image generator, describing scene, style, lighting, and mood.
    6.  For the 'theme', provide Tailwind CSS color names (e.g., 'blue', 'slate', 'indigo').
    7.  For 'iconName' fields, provide a relevant icon name from the Lucide icon library (e.g., 'Zap', 'ShieldCheck', 'BarChart', 'Award', 'Users', 'ThumbsUp', 'Target', 'Settings', 'Rocket', 'Mail', 'Code', 'Home', 'Info', 'AppWindow', 'MessageSquare').
    8.  For 'video' or 'course' sections, you can provide a YouTube video ID or a full HTML embed code for other sources.
    9.  For 'booking', provide a placeholder Calendly embed code snippet.
    10. For 'products', generate a few sample products with realistic details including a price, featured_image_url, gallery_images, and options with price modifiers. ${categoryInfo}.
    11. For 'footer', provide copyright text and 2-3 social media links.
    12. For 'sectionOrder', create a logical flow for all the sections you are generating. It must include all the keys from the 'Sections to Include' list above.
    13. For 'cartSettings' and 'bookingSettings', provide a placeholder email like 'notifications@example.com' and a '$' currency symbol.
    14. For 'stripeSettings', provide placeholder test keys, like 'pk_test_...' for the publishableKey and 'sk_test_...' for the secretKey.
    15. For the 'course' section: Generate a complete online course with 2-3 chapters, and 2-3 lessons per chapter. Each lesson should have a 'videoSource' ('youtube' or 'embed') and the corresponding ID or code. One lesson in the entire course must be a free preview. Do not generate 'worksheetUrl', leave it empty.
    16. For the 'embed' section: Generate a title/subtitle, set embedType to 'floating-script', apiKey to a placeholder, and use the specific Jessica AI bot script provided in other instructions.
    17. For EACH section object (hero, features, etc.), add an 'animation' property. A good default value is 'fade-in-up'.
    ---
    ${componentLibraryInfo}
    ---
    ${mediaLibraryInfo}
    ---
    ${productInfo}
  `;

  try {
    const modelConfig: any = {};
    if (useSearch) {
        modelConfig.tools = [{googleSearch: {}}];
    } else {
        modelConfig.responseMimeType = "application/json";
        modelConfig.responseSchema = dynamicSchema;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: modelConfig,
    });

    let text = response.text.trim();
    
    if (useSearch) {
        const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]+\})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            text = jsonMatch[1].trim();
        } else if (text.startsWith('{') && text.endsWith('}')) {
            // It's already a JSON string
        } else {
             const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
                text = text.substring(jsonStart, jsonEnd + 1);
            } else {
                console.error("Could not find a valid JSON object in the AI's response when using web search.", text);
                throw new Error("AI did not return a valid JSON object after analyzing URLs. The website might be too complex or inaccessible. Please try a different URL or simplify the prompt.");
            }
        }
    }
    
    try {
        return JSON.parse(text) as LandingPageData;
    } catch (parseError) {
        console.error("Final JSON parsing failed:", parseError, "Raw text intended for parsing:", text);
        throw new Error("AI returned an invalid JSON structure, which could not be parsed. Please check the console for details.");
    }
    
  } catch (error) {
    throw handleGeminiError(error, 'page structure generation');
  }
}

export async function generateNewSection(
    basePrompt: string,
    tone: string,
    palette: string,
    industry: string,
    sectionKey: string,
    mediaLibrary?: MediaFile[]
): Promise<any> {
    const sectionSchema = (LANDING_PAGE_SCHEMA.properties as any)[sectionKey as keyof typeof LANDING_PAGE_SCHEMA.properties];
    if (!sectionSchema) {
        throw new Error(`Invalid section key for generation: ${sectionKey}`);
    }

    const mediaLibraryInfo = mediaLibrary && mediaLibrary.length > 0
        ? `
        Also, consider the user's media library below. For any image prompts, try to find a suitable match from the library first and use its URL. If no match is found, then generate a new 'imagePrompt'.
        
        USER MEDIA LIBRARY (JSON):
        ${JSON.stringify(mediaLibrary.map(f => ({ url: f.url, name: f.name, description: f.description, keywords: f.keywords })))}
        `
        : '';

    const fullPrompt = `
        You are an expert web designer generating a new section for an existing landing page.
        The landing page's main concept is: "${basePrompt}"
        The page's industry focus is: "${industry}"
        The desired tone is "${tone}" and the color palette is "${palette}".

        INSTRUCTIONS:
        1. Generate the content for a new "${sectionKey}" section that fits seamlessly with the page's theme and concept.
        2. Adhere to the same content and style guidelines as if you were creating a full page. (e.g., use Lucide icons, realistic product details, etc.).
        3. For any image fields (like 'imagePrompt'), check the user's media library first (if provided). If a suitable image is found, use its public URL. Otherwise, create a new, detailed, artistic prompt for an AI image generator.
        4. For video sections, provide a YouTube video ID or a full HTML embed code.
        5. For the 'embed' section, generate a title/subtitle, set embedType to 'floating-script', apiKey to a placeholder, and use the specific Jessica AI bot script provided in other instructions.
        6. Set the 'animation' property for the section to 'fade-in-up'.
        7. Output *only* the new, valid JSON object for this section, conforming to the provided schema. Do not add any extra text or markdown.
        ---
        ${mediaLibraryInfo}
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: sectionSchema,
            },
        });
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (error) {
        throw handleGeminiError(error, `generating new section "${sectionKey}"`);
    }
}


export async function regenerateSectionContent(
  basePrompt: string,
  tone: string,
  palette: string,
  sectionKey: string,
  currentData: any,
  editPrompt: string,
  mediaLibrary?: MediaFile[]
): Promise<any> {
    const sectionSchema = (LANDING_PAGE_SCHEMA.properties as any)[sectionKey as keyof typeof LANDING_PAGE_SCHEMA.properties];
    if (!sectionSchema) {
        throw new Error(`Invalid section key: ${sectionKey}`);
    }

    const mediaLibraryInfo = mediaLibrary && mediaLibrary.length > 0
        ? `
        Also, consider the user's media library below. If the edit request implies a new image, try to find a suitable match from the library first and use its URL. If no match is found, then generate a new 'imagePrompt'.
        
        USER MEDIA LIBRARY (JSON):
        ${JSON.stringify(mediaLibrary.map(f => ({ url: f.url, name: f.name, description: f.description, keywords: f.keywords })))}
        `
        : '';

    const fullPrompt = `
        You are an expert web designer and SEO copywriter updating a section of a landing page.
        The original concept for the page was: "${basePrompt}" with a "${tone}" tone and "${palette}" color palette.

        Here is the current JSON for the section you are editing:
        ${JSON.stringify(currentData, null, 2)}

        The user wants to make the following change:
        "${editPrompt}"

        INSTRUCTIONS:
        1. Modify the provided JSON object based on the user's edit request. Your response MUST be different from the original JSON.
        2. When rewriting any text (titles, subtitles, descriptions), you MUST apply SEO best practices. This means improving clarity, readability, and naturally incorporating relevant keywords where appropriate.
        3. If the user wants to add or remove an item (e.g., a feature, a product, a testimonial, a lesson), do so. Otherwise, keep the number of items the same.
        4. If the request involves new imagery: First, check the user's media library (if provided). If a suitable image exists, use its public URL directly in the relevant image field (e.g., 'imagePrompt'). Otherwise, update the field with a new, detailed, artistic prompt for an AI image generator.
        5. If the request involves icons, update the 'iconName' field with a relevant icon name from the Lucide icon library (e.g., 'Zap', 'ShieldCheck', 'BarChart', 'Home').
        6. For a hero slider, if the user asks for different text on slides, populate the 'slides' array.
        7. Maintain the overall tone and style of the original page.
        8. Output *only* the updated, valid JSON object for this section, conforming to the provided schema. Do not add any extra text or markdown.
        ---
        ${mediaLibraryInfo}
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: sectionSchema,
            },
        });
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (error) {
        throw handleGeminiError(error, `regenerating section "${sectionKey}"`);
    }
}

export async function enhanceTextWithAI(
  textToEnhance: string,
  context: string,
): Promise<string> {
  const fullPrompt = `
    You are an expert copywriter with deep knowledge of on-page SEO. Your task is to enhance the user's provided text.
    Your response MUST be an improved version of the text.
    Critically, you must enhance the text with SEO best practices in mind. This means naturally incorporating relevant keywords if appropriate for the context, improving clarity, and ensuring the text is highly readable for both users and search engines.
    Do not replace the core meaning, but improve the wording, tone, and impact.
    Make it more compelling, professional, and engaging based on the context.
    Output only the enhanced text, without any introductory phrases, explanations, or quotes.

    CONTEXT: You are writing copy for a "${context}".
    TEXT TO ENHANCE: "${textToEnhance}"

    ENHANCED TEXT:
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const text = response.text.trim();
    // Sometimes the model might wrap the output in quotes, so we remove them.
    return text.replace(/^"|"$/g, '');
  } catch (error) {
    throw handleGeminiError(error, "text enhancement");
  }
}


export async function generateImageForPrompt(prompt: string, aspectRatio: '16:9' | '1:1' = '16:9'): Promise<string> {
  if (!prompt || prompt.trim() === '') {
    console.error("generateImageForPrompt called with an empty prompt.");
    throw new Error("Cannot generate an image without a prompt. Please provide a description.");
  }
  
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error) {
    throw handleGeminiError(error, `image generation for prompt "${prompt}"`);
  }
}

export async function generateImageDescription(imageBytes: string): Promise<{ description: string; keywords: string[] }> {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg', // The service converts uploads to jpeg for consistency
      data: imageBytes,
    },
  };
  const prompt = `Analyze this image and provide a concise, descriptive caption and a list of 5-7 relevant keywords for search. Format the output as a single, valid JSON object with two keys: "description" (a string) and "keywords" (an array of strings).`;
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING, description: "A concise, descriptive caption for the image." },
      keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 5-7 relevant keywords for the image." }
    },
    required: ["description", "keywords"]
  };

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema,
        },
    });

    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating image description:", (error as Error).message, error);
    // Return a fallback object in case of an error
    return {
        description: "Could not generate description.",
        keywords: ["error"]
    };
  }
}

export async function generateSeoForPage(
  pageData: LandingPageData,
): Promise<Pick<SEOData, 'title' | 'description' | 'keywords'>> {
  // Extract key content from the page data to provide context
  const contentContext = `
    - Hero Title: ${pageData.hero?.title}
    - Hero Subtitle: ${pageData.hero?.subtitle}
    ${pageData.features ? `- Features Title: ${pageData.features.title}` : ''}
    ${pageData.features ? `- Feature Items: ${pageData.features.items.map(f => f.name).join(', ')}` : ''}
    ${pageData.products ? `- Products Title: ${pageData.products.title}` : ''}
    ${pageData.whyChooseUs ? `- Why Choose Us Title: ${pageData.whyChooseUs.title}` : ''}
  `.trim();

  const fullPrompt = `
    You are an SEO expert. Based on the following content from a landing page, generate optimal SEO metadata.
    - The title should be concise and compelling (under 60 characters).
    - The meta description should be a brief summary of the page (around 155 characters).
    - The keywords should be a comma-separated list of relevant terms.
    Output only a valid JSON object conforming to the provided schema.

    PAGE CONTENT CONTEXT:
    ${contentContext}
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A concise SEO title (under 60 characters)." },
      description: { type: Type.STRING, description: "A meta description (around 155 characters)." },
      keywords: { type: Type.STRING, description: "Comma-separated list of keywords." },
    },
    required: ["title", "description", "keywords"],
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error) {
    throw handleGeminiError(error, "SEO data generation");
  }
}

export async function generateVeo3Prompt(concept: string): Promise<Veo3Prompt> {
  const prompt = `
    Based on the following high-level video concept, generate a detailed, structured JSON prompt suitable for a fine-tuned Veo3 video generation model.
    
    CONCEPT: "${concept}"

    INSTRUCTIONS:
    - Create a JSON object with optional 'audio' and 'dialog' keys, and a required 'scenes' array.
    - Each scene in the array must have a 'timeline' (e.g., "0-2s", "2-4s") and a description for 'action'.
    - Optionally, add details for 'character', 'camera', 'location', and 'labels' within each scene to create a rich and dynamic video prompt.
    - The timeline should increment every 2 seconds.
    - Output only the valid JSON object.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      audio: {
        type: Type.OBJECT,
        properties: { description: { type: Type.STRING } }
      },
      dialog: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            character: { type: Type.STRING },
            text: { type: Type.STRING }
          }
        }
      },
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            timeline: { type: Type.STRING },
            character: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            },
            camera: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                angle: { type: Type.STRING },
                movement: { type: Type.STRING }
              }
            },
            location: {
              type: Type.OBJECT,
              properties: { description: { type: Type.STRING } }
            },
            action: {
              type: Type.OBJECT,
              properties: { description: { type: Type.STRING } }
            },
            labels: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['timeline', 'action']
        }
      }
    },
    required: ['scenes']
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
      },
    });

    const text = response.text.trim();
    return JSON.parse(text) as Veo3Prompt;
  } catch (error) {
    throw handleGeminiError(error, "Veo3 prompt generation");
  }
}

export async function generateWan21Prompt(concept: string): Promise<string> {
  const prompt = `
    Based on the following high-level video concept, generate a detailed, single-line text prompt suitable for a wan2.1 video generation model.
    
    CONCEPT: "${concept}"

    INSTRUCTIONS:
    - The output MUST be a single, long line of text.
    - Do NOT use any line breaks, hard returns, or newline characters (\`\\n\`).
    - Separate different concepts, scenes, or details with only a single space.
    - Combine all descriptions, camera movements, and styles into one continuous string.
    - Do NOT use JSON, markdown, or any hierarchical formatting like hyphens.
    - The final output should be one long, flowing sentence or phrase.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    throw handleGeminiError(error, "wan2.1 prompt generation");
  }
}


export async function generateSeoReport(pageData: LandingPageData): Promise<any> {
  const contentContext = `
    - SEO Title: ${pageData.seo.title}
    - Meta Description: ${pageData.seo.description}
    - Keywords: ${pageData.seo.keywords}
    - Hero Title: ${pageData.hero?.title}
    - Hero Subtitle: ${pageData.hero?.subtitle}
    ${pageData.features ? `- Features: ${pageData.features.items.map(f => f.name).join(', ')}` : ''}
    ${pageData.products ? `- Products Title: ${pageData.products.title}` : ''}
    ${pageData.faq ? `- FAQ questions: ${pageData.faq.items.map(f => f.question).join(', ')}` : ''}
  `.trim();
  
  const fullPrompt = `
    You are an expert on-page SEO analyst. Your task is to analyze the provided content structure of a landing page and generate a detailed SEO report.
    - Analyze the SEO title, meta description, keywords, and key content sections.
    - Provide an overall score from 0-100.
    - Give specific, actionable feedback on the key areas.
    - List 3-5 clear recommendations for improvement.
    - You must output your response as a single, valid JSON object that conforms to the provided schema.

    ---
    PAGE CONTENT STRUCTURE TO ANALYZE:
    ${contentContext}
    ---
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: SEO_REPORT_SCHEMA,
      },
    });

    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error) {
    throw handleGeminiError(error, "SEO report generation");
  }
}

export async function enhanceTaskDescription(description: string): Promise<{ enhancedDescription: string, subtasks: string[] }> {
  const prompt = `
    Analyze the following task description. Your goal is to clarify it and break it down into a list of actionable sub-tasks.
    - Rewrite the description to be more specific, clear, and professional.
    - Generate a list of 3-5 concrete sub-tasks that would be required to complete the main task.
    - Output a valid JSON object with two keys: "enhancedDescription" (the rewritten text) and "subtasks" (an array of strings).

    ORIGINAL DESCRIPTION: "${description}"
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      enhancedDescription: { type: Type.STRING, description: "The rewritten, clear, and detailed task description." },
      subtasks: {
        type: Type.ARRAY,
        description: "A list of actionable sub-tasks derived from the description.",
        items: { type: Type.STRING }
      }
    },
    required: ["enhancedDescription", "subtasks"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });
    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error) {
    throw handleGeminiError(error, "task description enhancement");
  }
}

export async function enhanceTaskPrompt(prompt: string): Promise<string> {
  if (!ai) {
    throw new Error('Gemini AI is not configured. Please add your API key to the environment variables.');
  }
  
  const fullPrompt = `
    You are an AI assistant tasked with taking a user's simple prompt for a task and expanding it into a detailed, step-by-step set of instructions for another AI to follow.
    - The output should be a single block of text.
    - Use clear headings, bullet points, or numbered lists to structure the instructions.
    - Be specific and provide context where necessary.
    - Do not add any conversational text or introductions. Output only the enhanced instructions.

    USER PROMPT: "${prompt}"

    DETAILED INSTRUCTIONS:
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });
    return response.text.trim();
  } catch (error) {
    throw handleGeminiError(error, "task prompt enhancement");
  }
}
