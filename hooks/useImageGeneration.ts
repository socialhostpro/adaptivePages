import { useState, useCallback } from 'react';
import { generateAndUploadImage } from '../services/geminiService';
import type { ImageStore } from '../types';

export interface UseImageGenerationReturn {
  // Image regeneration for sections
  regenerateImage: (
    imageKey: string, 
    prompt: string, 
    userId: string,
    aspectRatio?: '16:9' | '1:1'
  ) => Promise<string>;
  
  // Bulk image generation for new pages/sections
  generateImagesForSection: (
    sectionKey: string,
    sectionData: any,
    userId: string,
    basePrompt: string,
    tone: string,
    palette: string
  ) => Promise<ImageStore>;
  
  // Image generation status
  generatingImages: string[];
  isGeneratingImages: boolean;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [generatingImages, setGeneratingImages] = useState<string[]>([]);
  
  const isGeneratingImages = generatingImages.length > 0;
  
  // Add image to generating list
  const addGeneratingImage = useCallback((imageKey: string) => {
    setGeneratingImages(prev => [...prev, imageKey]);
  }, []);
  
  // Remove image from generating list
  const removeGeneratingImage = useCallback((imageKey: string) => {
    setGeneratingImages(prev => prev.filter(key => key !== imageKey));
  }, []);
  
  // Regenerate a single image
  const regenerateImage = useCallback(async (
    imageKey: string, 
    prompt: string, 
    userId: string,
    aspectRatio: '16:9' | '1:1' = '16:9'
  ): Promise<string> => {
    addGeneratingImage(imageKey);
    
    try {
      const imageUrl = await generateAndUploadImage(prompt, imageKey, userId, aspectRatio);
      return imageUrl;
    } catch (error) {
      console.error(`Failed to regenerate image ${imageKey}:`, error);
      throw error;
    } finally {
      removeGeneratingImage(imageKey);
    }
  }, [addGeneratingImage, removeGeneratingImage]);
  
  // Generate all images for a section
  const generateImagesForSection = useCallback(async (
    sectionKey: string,
    sectionData: any,
    userId: string,
    basePrompt: string,
    tone: string,
    palette: string
  ): Promise<ImageStore> => {
    const imageKeys = getImageKeysForSection(sectionKey, sectionData);
    const imageStore: ImageStore = {};
    
    // Generate images in parallel
    const imagePromises = imageKeys.map(async (imageKey) => {
      addGeneratingImage(imageKey);
      
      try {
        const imagePrompt = generateImagePromptForKey(imageKey, sectionData, basePrompt, tone, palette);
        const aspectRatio = getAspectRatioForImageKey(imageKey);
        const imageUrl = await generateAndUploadImage(imagePrompt, imageKey, userId, aspectRatio);
        return { imageKey, imageUrl };
      } catch (error) {
        console.error(`Failed to generate image ${imageKey}:`, error);
        return { imageKey, imageUrl: null };
      } finally {
        removeGeneratingImage(imageKey);
      }
    });
    
    const results = await Promise.all(imagePromises);
    
    // Build image store from results
    results.forEach(({ imageKey, imageUrl }) => {
      if (imageUrl) {
        imageStore[imageKey] = imageUrl;
      }
    });
    
    return imageStore;
  }, [addGeneratingImage, removeGeneratingImage]);
  
  return {
    regenerateImage,
    generateImagesForSection,
    generatingImages,
    isGeneratingImages
  };
}

// Helper function to extract image keys from section data
function getImageKeysForSection(sectionKey: string, sectionData: any): string[] {
  const imageKeys: string[] = [];
  
  if (!sectionData) return imageKeys;
  
  // Handle different section types
  switch (sectionKey) {
    case 'hero':
      if (sectionData.backgroundImage) imageKeys.push('hero_backgroundImage');
      if (sectionData.slides) {
        sectionData.slides.forEach((_: any, index: number) => {
          imageKeys.push(`hero_slide${index}_backgroundImage`);
        });
      }
      break;
      
    case 'gallery':
      if (sectionData.images) {
        sectionData.images.forEach((_: any, index: number) => {
          imageKeys.push(`gallery_image${index}`);
        });
      }
      break;
      
    case 'testimonials':
      if (sectionData.testimonials) {
        sectionData.testimonials.forEach((_: any, index: number) => {
          imageKeys.push(`testimonials_testimonial${index}_avatar`);
        });
      }
      break;
      
    case 'team':
      if (sectionData.teamMembers) {
        sectionData.teamMembers.forEach((_: any, index: number) => {
          imageKeys.push(`team_member${index}_photo`);
        });
      }
      break;
      
    default:
      // Generic section with image property
      if (sectionData.image) imageKeys.push(`${sectionKey}_image`);
      if (sectionData.backgroundImage) imageKeys.push(`${sectionKey}_backgroundImage`);
      break;
  }
  
  return imageKeys;
}

// Helper function to generate appropriate prompts for different image types
function generateImagePromptForKey(
  imageKey: string, 
  sectionData: any, 
  basePrompt: string,
  tone: string,
  palette: string
): string {
  const lowerKey = imageKey.toLowerCase();
  
  if (lowerKey.includes('avatar') || lowerKey.includes('photo')) {
    return `Professional headshot of a person, ${tone.toLowerCase()} style, clean background, high quality portrait`;
  }
  
  if (lowerKey.includes('background')) {
    return `Abstract background image for a ${tone.toLowerCase()} website, ${palette.toLowerCase()} color scheme, modern design`;
  }
  
  if (lowerKey.includes('gallery')) {
    return `Professional image for business gallery, ${tone.toLowerCase()} style, ${palette.toLowerCase()} colors, high quality`;
  }
  
  // Default prompt based on section content
  return `Professional image for ${basePrompt}, ${tone.toLowerCase()} style, ${palette.toLowerCase()} color scheme`;
}

// Helper function to determine aspect ratio for different image types
function getAspectRatioForImageKey(imageKey: string): '16:9' | '1:1' {
  const lowerKey = imageKey.toLowerCase();
  
  if (lowerKey.includes('avatar') || lowerKey.includes('photo') || lowerKey.includes('testimonial')) {
    return '1:1'; // Square for portraits
  }
  
  return '16:9'; // Landscape for backgrounds and general images
}
