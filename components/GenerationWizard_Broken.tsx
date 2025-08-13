import React, { useState, useEffect } from 'react';
import { SeoOptimizationService, type SeoAnalysis, type SeoOptimizedSection } from './SeoOptimizationService';
import SeoAuditDashboard from './SeoAuditDashboard';
import { BusinessIntelligenceDashboard } from './BusinessIntelligenceDashboard';
import { TONES, PALETTES, INDUSTRIES } from '../constants';
import { Button, Input, Select, Textarea } from './shared';
import { Card } from './shared/Card';
import SparklesIcon from './icons/SparklesIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import CheckIcon from './icons/CheckIcon';
import GlobeIcon from './icons/GlobeIcon';
import { searchBusiness, searchBusinessGeneral, type BusinessSearchResult } from '../services/businessLookupService';
import { searchRealBusiness, isGooglePlacesConfigured, getGooglePlacesApiKey, generateBusinessLandingPageContent, type RealBusinessSearchResult } from '../services/realBusinessLookupService';

// Import step components
import {
  Step1BasicInfo,
  Step2ToneIndustry,
  Step3ColorPalette,
  Step4ReferenceWebsites,
  Step5BusinessInfo,
  Step6SeoStrategy,
  type LocalBusinessData
} from './GenerationWizard/';

interface GenerationWizardProps {
  prompt: string;
  setPrompt: (value: string) => void;
  tone: string;
  setTone: (value: string) => void;
  palette: string;
  setPalette: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  oldSiteUrl: string;
  setOldSiteUrl: (value: string) => void;
  inspirationUrl: string;
  setInspirationUrl: (value: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  onClose: () => void;
  // New SEO & Local Business props
  localBusinessData?: LocalBusinessData;
  onLocalBusinessDataChange?: (data: LocalBusinessData) => void;
  enableSeoMode?: boolean;
}

const GenerationWizard: React.FC<GenerationWizardProps> = ({
  prompt,
  setPrompt,
  tone,
  setTone,
  palette,
  setPalette,
  industry,
  setIndustry,
  oldSiteUrl,
  setOldSiteUrl,
  inspirationUrl,
  setInspirationUrl,
  isLoading,
  onGenerate,
  onClose,
  localBusinessData,
  onLocalBusinessDataChange,
  enableSeoMode = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = enableSeoMode ? 6 : 4;
  
  // Load persisted data from localStorage on component mount
  const loadPersistedData = () => {
    try {
      const saved = localStorage.getItem('generationWizard');
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaultBusinessData = {
          businessName: '',
          businessType: '',
          website: '',
          zipCode: '',
          address: '',
          phone: '',
          email: '',
          serviceAreaZips: [],
          brandTerms: [],
          targetKeywords: [],
          competitorUrls: [],
          primaryServices: [],
          uniqueSellingPoints: []
        };
        
        return {
          prompt: parsed.prompt || '',
          tone: parsed.tone || '',
          palette: parsed.palette || '',
          industry: parsed.industry || '',
          oldSiteUrl: parsed.oldSiteUrl || '',
          inspirationUrl: parsed.inspirationUrl || '',
          businessData: parsed.businessData || defaultBusinessData,
          currentStep: parsed.currentStep || 1
        };
      }
    } catch (error) {
      console.error('Failed to load persisted wizard data:', error);
    }
    return null;
  };

  // Save data to localStorage
  const saveToLocalStorage = () => {
    try {
      const dataToSave = {
        prompt,
        tone,
        palette,
        industry,
        oldSiteUrl,
        inspirationUrl,
        businessData,
        currentStep
      };
      localStorage.setItem('generationWizard', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save wizard data:', error);
    }
  };

  // SEO state
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);
  const [seoSections, setSeoSections] = useState<SeoOptimizedSection[]>([]);
  const [isAnalyzingSeo, setIsAnalyzingSeo] = useState(false);
  const [showSeoAudit, setShowSeoAudit] = useState(false);
  
  // Business Intelligence Dashboard state
  const [showBusinessIntelligence, setShowBusinessIntelligence] = useState(false);
  
  // Website analysis state
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState(false);
  const [websiteAnalysisResults, setWebsiteAnalysisResults] = useState<any>(null);
  
  // Generation status state
  const [generationStatus, setGenerationStatus] = useState<string>('');
  
  // Business lookup state
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [isSearchingBusiness, setIsSearchingBusiness] = useState(false);
  const [businessSearchResults, setBusinessSearchResults] = useState<BusinessSearchResult[]>([]);
  const [showBusinessResults, setShowBusinessResults] = useState(false);
  
  // Local state for business data
  const [businessData, setBusinessData] = useState<LocalBusinessData>(
    localBusinessData || {
      businessName: '',
      businessType: '',
      website: '',
      zipCode: '',
      address: '',
      phone: '',
      email: '',
      serviceAreaZips: [],
      brandTerms: [],
      targetKeywords: [],
      competitorUrls: [],
      primaryServices: [],
      uniqueSellingPoints: []
    }
  );

  // Load persisted data on mount
  useEffect(() => {
    const persistedData = loadPersistedData();
    if (persistedData) {
      setPrompt(persistedData.prompt);
      setTone(persistedData.tone);
      setPalette(persistedData.palette);
      setIndustry(persistedData.industry);
      setOldSiteUrl(persistedData.oldSiteUrl);
      setInspirationUrl(persistedData.inspirationUrl);
      setBusinessData(persistedData.businessData);
      setCurrentStep(persistedData.currentStep);
    }
  }, []);

  // Clear any cached yoga content on mount to ensure clean slate
  useEffect(() => {
    const cachedPrompt = localStorage.getItem('ai-lp-generator-prompt');
    if (cachedPrompt && cachedPrompt.includes('ZenFlow') || cachedPrompt && cachedPrompt.includes('yoga')) {
      console.log('🧹 Clearing cached yoga content from localStorage');
      localStorage.removeItem('ai-lp-generator-prompt');
    }
  }, []);

  // Save data whenever any form field changes
  useEffect(() => {
    saveToLocalStorage();
  }, [prompt, tone, palette, industry, oldSiteUrl, inspirationUrl, businessData, currentStep]);

  const toneOptions = Object.entries(TONES).map(([key, value]) => ({ value: key, label: value }));
  const paletteOptions = Object.entries(PALETTES).map(([key, value]) => ({ 
    value: key, 
    label: value.name,
    colors: value.colors,
    description: value.description
  }));
  const industryOptions = Object.entries(INDUSTRIES).map(([key, value]) => ({ value: key, label: value }));

  const updateBusinessData = (updates: Partial<LocalBusinessData>) => {
    const newData = { ...businessData, ...updates };
    setBusinessData(newData);
    onLocalBusinessDataChange?.(newData);
  };

  const handleSeoAnalysis = async () => {
    if (!enableSeoMode || !businessData.businessName) return;
    
    setIsAnalyzingSeo(true);
    try {
      const analysis = await SeoOptimizationService.analyzeBusiness(businessData);
      setSeoAnalysis(analysis);
      
      const sections = await SeoOptimizationService.generateSeoOptimizedSections(businessData, analysis);
      setSeoSections(sections);
      
      setShowSeoAudit(true);
    } catch (error) {
      console.error('SEO analysis failed:', error);
    } finally {
      setIsAnalyzingSeo(false);
    }
  };

  // Function to analyze website and auto-fill business data
  const analyzeWebsite = async (url: string) => {
    if (!url || !url.startsWith('http')) return;
    
    setIsAnalyzingWebsite(true);
    try {
      console.log('🔍 Starting comprehensive website analysis for:', url);
      
      // Try real API first (for production use)
      const response = await fetch(`/api/analyze-website?url=${encodeURIComponent(url)}`);
      
      if (response.ok) {
        const data = await response.json();
        setWebsiteAnalysisResults(data);
        
        // Auto-fill business data from comprehensive website analysis
        updateBusinessData({
          businessName: data.businessName || businessData.businessName,
          businessType: data.businessType || businessData.businessType,
          address: data.address || businessData.address,
          phone: data.phone || businessData.phone,
          email: data.email || businessData.email,
          primaryServices: data.services || businessData.primaryServices,
          targetKeywords: data.keywords || businessData.targetKeywords,
          brandTerms: data.brandTerms || businessData.brandTerms,
          uniqueSellingPoints: data.uniqueSellingPoints || businessData.uniqueSellingPoints
        });
        
        // Also update the basic fields if they're empty
        if (!prompt && data.description) {
          setPrompt(data.description);
        }
        if (!industry && data.industry) {
          setIndustry(data.industry);
        }
        
        console.log('✅ Real API analysis complete');
      } else {
        // Fallback to enhanced simulation
        await performEnhancedWebsiteAnalysis(url);
      }
    } catch (error) {
      console.error('Real API failed, using enhanced simulation:', error);
      // Enhanced simulation with comprehensive data extraction
      await performEnhancedWebsiteAnalysis(url);
    } finally {
      setIsAnalyzingWebsite(false);
    }
  };

  // Enhanced website analysis simulation that extracts comprehensive data
  const performEnhancedWebsiteAnalysis = async (url: string) => {
    try {
      console.log('🔍 Starting enhanced website analysis simulation...');
      
      const domain = new URL(url).hostname.replace('www.', '');
      const businessName = domain.split('.')[0];
      
      // Enhanced business type detection with more keywords
      const businessTypeKeywords = {
        'restaurant': 'Restaurant',
        'cafe': 'Cafe', 
        'coffee': 'Coffee Shop',
        'bakery': 'Bakery',
        'law': 'Law Firm',
        'legal': 'Law Firm',
        'attorney': 'Law Firm',
        'lawyer': 'Law Firm',
        'dental': 'Dental Practice',
        'dentist': 'Dental Practice',
        'medical': 'Medical Practice',
        'doctor': 'Medical Practice',
        'clinic': 'Medical Clinic',
        'hospital': 'Hospital',
        'plumbing': 'Plumbing Service',
        'plumber': 'Plumbing Service',
        'auto': 'Auto Repair',
        'car': 'Auto Service',
        'mechanic': 'Auto Repair',
        'real': 'Real Estate',
        'realty': 'Real Estate',
        'homes': 'Real Estate',
        'construction': 'Construction Company',
        'contractor': 'Contractor',
        'builder': 'Construction Company',
        'salon': 'Beauty Salon',
        'hair': 'Hair Salon',
        'spa': 'Spa',
        'massage': 'Massage Therapy',
        'fitness': 'Fitness Center',
        'gym': 'Fitness Center',
        'yoga': 'Yoga Studio',
        'accounting': 'Accounting Firm',
        'tax': 'Tax Service',
        'insurance': 'Insurance Agency',
        'cleaning': 'Cleaning Service',
        'landscaping': 'Landscaping Service',
        'garden': 'Landscaping Service',
        'pest': 'Pest Control',
        'hvac': 'HVAC Service',
        'roofing': 'Roofing Service',
        'flooring': 'Flooring Service',
        'painting': 'Painting Service',
        'security': 'Security Service',
        'moving': 'Moving Company',
        'storage': 'Storage Facility',
        'veterinary': 'Veterinary Clinic',
        'vet': 'Veterinary Clinic',
        'pet': 'Pet Services',
        'grooming': 'Pet Grooming',
        'photography': 'Photography Studio',
        'wedding': 'Wedding Services',
        'catering': 'Catering Service',
        'florist': 'Florist',
        'jewelry': 'Jewelry Store',
        'watch': 'Watch Repair',
        'computer': 'Computer Repair',
        'tech': 'Technology Services',
        'web': 'Web Design',
        'marketing': 'Marketing Agency',
        'consulting': 'Consulting Firm'
      };
      
      let detectedType = 'Local Business';
      let detectedKeywords: string[] = [];
      
      // Detect business type and collect relevant keywords
      for (const [keyword, type] of Object.entries(businessTypeKeywords)) {
        if (domain.toLowerCase().includes(keyword)) {
          detectedType = type;
          detectedKeywords.push(keyword);
          break;
        }
      }
      
      // Generate comprehensive business data based on analysis
      const formattedBusinessName = businessName.charAt(0).toUpperCase() + businessName.slice(1);
      
      // Generate realistic primary services based on business type
      const servicesByType: Record<string, string[]> = {
        'Restaurant': ['Fine Dining', 'Takeout Orders', 'Catering Services', 'Private Events'],
        'Plumbing Service': ['Emergency Repairs', 'Drain Cleaning', 'Water Heater Installation', 'Pipe Replacement'],
        'Law Firm': ['Personal Injury', 'Family Law', 'Criminal Defense', 'Business Law'],
        'Dental Practice': ['General Dentistry', 'Cosmetic Dentistry', 'Root Canals', 'Teeth Whitening'],
        'Auto Repair': ['Oil Changes', 'Brake Repair', 'Engine Diagnostics', 'Transmission Service'],
        'Real Estate': ['Home Sales', 'Property Management', 'Investment Properties', 'First-Time Buyers'],
        'Beauty Salon': ['Hair Cuts', 'Hair Coloring', 'Styling', 'Hair Treatments'],
        'Local Business': ['Customer Service', 'Professional Services', 'Local Delivery', 'Consultations']
      };
      
      // Generate SEO keywords based on business type and location
      const generateKeywords = (businessType: string, businessName: string) => {
        const baseKeywords = [
          `${businessType.toLowerCase()}`,
          `${businessName.toLowerCase()}`,
          `best ${businessType.toLowerCase()}`,
          `${businessType.toLowerCase()} near me`,
          `local ${businessType.toLowerCase()}`,
          `professional ${businessType.toLowerCase()}`,
          `affordable ${businessType.toLowerCase()}`,
          `top rated ${businessType.toLowerCase()}`
        ];
        
        // Add service-specific keywords
        const services = servicesByType[businessType] || [];
        services.forEach(service => {
          baseKeywords.push(service.toLowerCase());
          baseKeywords.push(`${service.toLowerCase()} service`);
        });
        
        return baseKeywords;
      };
      
      // Generate brand terms
      const generateBrandTerms = (businessName: string, businessType: string) => {
        return [
          businessName,
          `${businessName} ${businessType}`,
          `${businessName} services`,
          `${businessName} company`,
          `${businessName} professional`
        ];
      };
      
      // Generate unique selling points based on business type
      const generateUSPs = (businessType: string) => {
        const uspsByType: Record<string, string[]> = {
          'Restaurant': ['Fresh Ingredients Daily', 'Family Recipes', 'Fast Service', 'Cozy Atmosphere'],
          'Plumbing Service': ['24/7 Emergency Service', 'Licensed & Insured', 'Free Estimates', 'Same Day Service'],
          'Law Firm': ['Experienced Attorneys', 'Free Consultation', 'Proven Track Record', 'Personalized Service'],
          'Dental Practice': ['Modern Equipment', 'Gentle Care', 'Insurance Accepted', 'Evening Hours Available'],
          'Auto Repair': ['ASE Certified Technicians', 'Warranty on All Work', 'Honest Pricing', 'Quick Turnaround'],
          'Real Estate': ['Local Market Expert', 'Full Service Agent', 'Competitive Commission', 'Proven Results'],
          'Beauty Salon': ['Experienced Stylists', 'Premium Products', 'Relaxing Environment', 'Affordable Prices'],
          'Local Business': ['Personalized Service', 'Local Expertise', 'Competitive Pricing', 'Quality Guaranteed']
        };
        
        return uspsByType[businessType] || uspsByType['Local Business'];
      };
      
      const generatedKeywords = generateKeywords(detectedType, formattedBusinessName);
      const generatedBrandTerms = generateBrandTerms(formattedBusinessName, detectedType);
      const generatedServices = servicesByType[detectedType] || servicesByType['Local Business'];
      const generatedUSPs = generateUSPs(detectedType);
      
      console.log('📊 Generated comprehensive business data:', {
        businessName: formattedBusinessName,
        businessType: detectedType,
        keywords: generatedKeywords.length,
        services: generatedServices.length,
        usps: generatedUSPs.length
      });
      
      // Update business data with comprehensive information
      const enhancedBusinessData = {
        ...businessData,
        businessName: formattedBusinessName,
        businessType: detectedType,
        website: url,
        primaryServices: generatedServices,
        targetKeywords: generatedKeywords,
        brandTerms: generatedBrandTerms,
        uniqueSellingPoints: generatedUSPs
      };
      
      setBusinessData(enhancedBusinessData);
      setWebsiteAnalysisResults({ 
        success: true, 
        analyzed: url,
        comprehensive: true,
        extractedData: {
          keywords: generatedKeywords.length,
          services: generatedServices.length,
          brandTerms: generatedBrandTerms.length,
          usps: generatedUSPs.length
        }
      });
      
      // Update prompt with more detailed information
      if (!prompt || prompt.trim() === '') {
        const enhancedPrompt = `Professional landing page for ${formattedBusinessName}, a ${detectedType.toLowerCase()} specializing in ${generatedServices.slice(0, 3).join(', ')}. Highlight our unique selling points: ${generatedUSPs.slice(0, 2).join(' and ')}. Include services overview, customer testimonials, contact information, and strong call-to-action for new customers.`;
        setPrompt(enhancedPrompt);
        console.log('📝 Generated enhanced prompt');
      }
      
      // Set industry mapping
      const industryMapping = {
        'Restaurant': 'food',
        'Cafe': 'food',
        'Coffee Shop': 'food',
        'Bakery': 'food',
        'Law Firm': 'legal',
        'Dental Practice': 'healthcare',
        'Medical Practice': 'healthcare',
        'Medical Clinic': 'healthcare',
        'Hospital': 'healthcare',
        'Plumbing Service': 'home-services',
        'Auto Repair': 'automotive',
        'Auto Service': 'automotive',
        'Real Estate': 'real-estate',
        'Construction Company': 'construction',
        'Contractor': 'construction',
        'Beauty Salon': 'beauty',
        'Hair Salon': 'beauty',
        'Spa': 'beauty',
        'Massage Therapy': 'beauty',
        'Fitness Center': 'fitness',
        'Yoga Studio': 'fitness',
        'Local Business': 'other'
      };
      
      const detectedIndustry = industryMapping[detectedType] || 'other';
      if (!industry || industry === '') {
        setIndustry(detectedIndustry);
        console.log('🏭 Set industry to:', detectedIndustry);
      }
      
      console.log('🎉 Enhanced website analysis complete!');
      
    } catch (error) {
      console.error('Enhanced analysis error:', error);
    }
  };

  // Simulate website analysis with basic domain/URL heuristics
  const simulateWebsiteAnalysis = async (url: string) => {
    try {
      console.log('🔍 Analyzing website:', url);
      const domain = new URL(url).hostname.replace('www.', '');
      const businessName = domain.split('.')[0];
      
      // Basic business type detection from domain keywords
      const businessTypeKeywords = {
        'restaurant': 'Restaurant',
        'cafe': 'Cafe',
        'bakery': 'Bakery',
        'law': 'Law Firm',
        'legal': 'Law Firm',
        'attorney': 'Law Firm',
        'dental': 'Dental Practice',
        'dentist': 'Dental Practice',
        'medical': 'Medical Practice',
        'doctor': 'Medical Practice',
        'plumbing': 'Plumbing Service',
        'plumber': 'Plumbing Service',
        'auto': 'Auto Repair',
        'car': 'Auto Service',
        'real': 'Real Estate',
        'realty': 'Real Estate',
        'construction': 'Construction Company',
        'contractor': 'Contractor',
        'salon': 'Beauty Salon',
        'spa': 'Spa',
        'fitness': 'Fitness Center',
        'gym': 'Fitness Center'
      };
      
      let detectedType = 'Local Business';
      for (const [keyword, type] of Object.entries(businessTypeKeywords)) {
        if (domain.toLowerCase().includes(keyword)) {
          detectedType = type;
          break;
        }
      }
      
      const formattedBusinessName = businessName.charAt(0).toUpperCase() + businessName.slice(1);
      
      console.log('✅ Analysis complete:', {
        businessName: formattedBusinessName,
        businessType: detectedType,
        website: url
      });
      
      // Auto-fill basic information
      const updatedData = {
        ...businessData,
        businessName: formattedBusinessName,
        businessType: detectedType,
        website: url
      };
      
      setBusinessData(updatedData);
      setWebsiteAnalysisResults({ success: true, analyzed: url });
      
      // If main prompt is empty, create a basic one
      if (!prompt || prompt.trim() === '') {
        const newPrompt = `Professional landing page for ${formattedBusinessName}, a ${detectedType.toLowerCase()}. Include services overview, contact information, and call-to-action for new customers.`;
        setPrompt(newPrompt);
        console.log('📝 Updated prompt:', newPrompt);
      }
      
      // Set industry if we can detect it
      const industryMapping = {
        'Restaurant': 'food',
        'Cafe': 'food',
        'Bakery': 'food',
        'Law Firm': 'legal',
        'Dental Practice': 'healthcare',
        'Medical Practice': 'healthcare',
        'Plumbing Service': 'home-services',
        'Auto Repair': 'automotive',
        'Auto Service': 'automotive',
        'Real Estate': 'real-estate',
        'Construction Company': 'construction',
        'Contractor': 'construction',
        'Beauty Salon': 'beauty',
        'Spa': 'beauty',
        'Fitness Center': 'fitness',
        'Local Business': 'other'
      };
      
      const detectedIndustry = industryMapping[detectedType] || 'other';
      if (!industry || industry === '') {
        setIndustry(detectedIndustry);
        console.log('🏭 Updated industry:', detectedIndustry);
      }
      
      console.log('🎉 Auto-fill complete!');
      
    } catch (error) {
      console.error('URL parsing error:', error);
    }
  };

  // Business search functionality
  const handleBusinessSearch = async () => {
    if (!businessSearchQuery.trim()) return;
    
    setIsSearchingBusiness(true);
    setShowBusinessResults(false);
    
    try {
      console.log('🔍 Searching for business:', businessSearchQuery);
      
      // Check if Google Places API is configured for real data
      const hasRealApi = isGooglePlacesConfigured();
      
      if (hasRealApi) {
        console.log('🌟 Using REAL Google Places API via Supabase Edge Function');
        
        // Try to extract business name and location from query
        const areaCodeMatch = businessSearchQuery.match(/\b\d{3}\b/);
        const areaCode = areaCodeMatch ? areaCodeMatch[0] : '';
        const businessName = businessSearchQuery.replace(/\b\d{3}\b/g, '').trim();
        const location = areaCode || businessSearchQuery.split(' ').slice(-1)[0]; // Use area code or last word as location
        
        const realResults = await searchRealBusiness(businessName, location);
        
        // Convert real results to our expected format
        const results: BusinessSearchResult[] = realResults.map(real => ({
          name: real.name,
          address: real.address,
          phone: real.phone || '',
          website: real.website || `https://${real.name.toLowerCase().replace(/\s+/g, '')}.com`,
          businessType: real.businessType,
          zipCode: real.address.match(/\b\d{5}\b/)?.[0] || '',
          email: `info@${real.name.toLowerCase().replace(/\s+/g, '')}.com`,
          description: `${real.name} is a ${real.businessType.toLowerCase()} located in ${real.address}`,
          keywords: [real.businessType.toLowerCase(), real.name.toLowerCase()],
          services: [real.businessType],
          hours: real.hours?.join(', ') || "Mon-Fri 9AM-5PM",
          rating: real.rating || 4.5,
          reviewCount: real.reviewCount || 0,
          isReal: true // Flag to indicate this is real data
        }));
        
        setBusinessSearchResults(results);
        setShowBusinessResults(true);
        console.log('✅ REAL business search completed, found', results.length, 'verified businesses');
        
      } else {
        console.log('⚠️ Using simulated data - deploy Supabase Edge Function for real data');
        
        // Fallback to simulated data
        const areaCodeMatch = businessSearchQuery.match(/\b\d{3}\b/);
        const areaCode = areaCodeMatch ? areaCodeMatch[0] : '';
        const businessName = businessSearchQuery.replace(/\b\d{3}\b/g, '').trim();
        
        let results: BusinessSearchResult[];
        
        if (businessName && areaCode) {
          results = await searchBusiness(businessName, areaCode);
        } else {
          results = await searchBusinessGeneral(businessSearchQuery);
        }
        
        setBusinessSearchResults(results);
        setShowBusinessResults(true);
        console.log('✅ Simulated business search completed, found', results.length, 'results');
      }
      
    } catch (error) {
      console.error('❌ Business search error:', error);
      setBusinessSearchResults([]);
      setShowBusinessResults(false);
      
      // Show user-friendly error message
      if (error.message?.includes('API key')) {
        console.log('💡 To get real business data, add your Google Places API key to .env');
      }
    } finally {
      setIsSearchingBusiness(false);
    }
  };

  // Handle adding keywords to SEO configuration
  const handleAddKeywordsToSeo = (keywords: string[], type: 'secondary' | 'longtail' | 'question') => {
    console.log(`📋 Adding ${type} keywords to SEO configuration:`, keywords);
    
    const updatedBusinessData = { ...businessData };
    
    // Add keywords to existing target keywords, avoiding duplicates
    const existingKeywords = new Set(updatedBusinessData.targetKeywords);
    keywords.forEach(keyword => existingKeywords.add(keyword));
    updatedBusinessData.targetKeywords = Array.from(existingKeywords);
    
    // Also add to brand terms if they're question keywords (good for content marketing)
    if (type === 'question') {
      const existingBrandTerms = new Set(updatedBusinessData.brandTerms);
      keywords.forEach(keyword => existingBrandTerms.add(keyword));
      updatedBusinessData.brandTerms = Array.from(existingBrandTerms);
    }
    
    // Update business data
    setBusinessData(updatedBusinessData);
    
    // Show success message
    alert(`✅ Added ${keywords.length} ${type} keywords to your SEO configuration!`);
  };

  const handleSelectBusinessResult = (result: BusinessSearchResult) => {
    console.log('📋 Applying business data from search result:', result);
    
    // Auto-fill business data
    const updatedData: LocalBusinessData = {
      ...businessData,
      businessName: result.name,
      businessType: result.businessType,
      website: result.website,
      address: result.address,
      zipCode: result.zipCode,
      phone: result.phone,
      email: result.email,
      primaryServices: result.services,
      targetKeywords: result.keywords,
      uniqueSellingPoints: [`${result.rating} star rating with ${result.reviewCount} reviews`, ...result.services.slice(0, 3).map(s => `Expert ${s}`)],
      brandTerms: [result.name, ...result.keywords.slice(0, 4)]
    };
    
    setBusinessData(updatedData);
    
    // Auto-fill website URL for analysis
    setOldSiteUrl(result.website);
    
    // Clear localStorage cache to prevent yoga text from persisting
    localStorage.removeItem('ai-lp-generator-prompt');
    localStorage.removeItem('generationWizard');
    
    // Generate AI-powered landing page content based on real business data
    let newPrompt: string;
    
    if (result.isReal) {
      // Convert to RealBusinessSearchResult format for enhanced content generation
      const realBusinessData: RealBusinessSearchResult = {
        placeId: result.name.toLowerCase().replace(/\s+/g, '-'),
        name: result.name,
        address: result.address,
        phone: result.phone,
        website: result.website,
        businessType: result.businessType,
        rating: result.rating,
        reviewCount: result.reviewCount,
        hours: [result.hours],
        verified: true,
        location: { lat: 0, lng: 0 }, // Default values
        reviews: [], // TODO: Add real reviews when available
        photos: [] // TODO: Add real photos when available
      };
      
      newPrompt = generateBusinessLandingPageContent(realBusinessData);
    } else {
      // Fallback for simulated data
      newPrompt = `Professional landing page for ${result.name}, a ${result.businessType.toLowerCase()}. ${result.description}`;
    }
    
    setPrompt(newPrompt);
    
    // Hide search results
    setShowBusinessResults(false);
    setBusinessSearchQuery('');
    
    console.log('🎉 Business data auto-filled successfully!');
  };

  const handleGenerate = async () => {
    // DON'T clear persisted data until AFTER successful generation
    // The parent component should call a success callback to clear data
    
    // If we have a business website, use it as the oldSiteUrl for analysis
    if (enableSeoMode && businessData.website && !oldSiteUrl) {
      setOldSiteUrl(businessData.website);
    }
    
    // Set detailed generation status
    if (enableSeoMode) {
      setGenerationStatus('Initializing SEO analysis...');
      
      // Simulate different stages of generation with status updates
      setTimeout(() => setGenerationStatus('Analyzing keywords and competition...'), 1000);
      setTimeout(() => setGenerationStatus('Generating SEO-optimized content...'), 3000);
      setTimeout(() => setGenerationStatus('Creating responsive layout...'), 5000);
      setTimeout(() => setGenerationStatus('Optimizing for local search...'), 7000);
      setTimeout(() => setGenerationStatus('Finalizing your landing page...'), 9000);
    } else {
      setGenerationStatus('Generating your landing page...');
      setTimeout(() => setGenerationStatus('Creating layout and content...'), 2000);
      setTimeout(() => setGenerationStatus('Applying your chosen design...'), 4000);
      setTimeout(() => setGenerationStatus('Finalizing page structure...'), 6000);
    }
    
    // Call the parent's generate function
    try {
      await onGenerate();
      
      // Only clear data after successful generation
      console.log('🎉 Generation successful, clearing wizard data');
      localStorage.removeItem('generationWizard');
      setGenerationStatus('Generation complete! ✨');
      
      // Let the parent component handle closing based on isGenerated state
      // The EnhancedControlPanel will automatically hide wizard when isGenerated becomes true
      setTimeout(() => {
        setGenerationStatus('');
      }, 1500);
    } catch (error) {
      console.error('❌ Generation failed:', error);
      setGenerationStatus('Generation failed. Please try again.');
      
      // Don't clear data on failure so user can retry
      setTimeout(() => {
        setGenerationStatus('');
      }, 3000);
    }
  };

  const addToArray = (field: keyof LocalBusinessData, value: string) => {
    if (value.trim()) {
      const currentArray = businessData[field] as string[];
      if (!currentArray.includes(value.trim())) {
        updateBusinessData({
          [field]: [...currentArray, value.trim()]
        });
      }
    }
  };

  const removeFromArray = (field: keyof LocalBusinessData, index: number) => {
    const currentArray = businessData[field] as string[];
    updateBusinessData({
      [field]: currentArray.filter((_, i) => i !== index)
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return prompt.trim().length > 0;
      case 2:
        return tone && industry;
      case 3:
        return palette;
      case 4:
        return true; // URLs are optional
      case 5: // Local Business Info (SEO Mode)
        if (!enableSeoMode) return true;
        return businessData.businessName && businessData.businessType && businessData.zipCode;
      case 6: // SEO Strategy (SEO Mode)
        if (!enableSeoMode) return true;
        return businessData.primaryServices.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      if (enableSeoMode && currentStep === 4) {
        // Trigger SEO analysis before moving to step 5
        handleSeoAnalysis();
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create Your Landing Page
                </h2>
                <p className="text-gray-600 dark:text-slate-400">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i + 1 <= currentStep
                      ? 'bg-indigo-600 dark:bg-indigo-400'
                      : 'bg-gray-200 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <Step1BasicInfo
              prompt={prompt}
              setPrompt={setPrompt}
              enableSeoMode={enableSeoMode}
              businessSearchQuery={businessSearchQuery}
              setBusinessSearchQuery={setBusinessSearchQuery}
              isSearchingBusiness={isSearchingBusiness}
              showBusinessResults={showBusinessResults}
              businessSearchResults={businessSearchResults}
              businessData={businessData}
              updateBusinessData={updateBusinessData}
              isAnalyzingWebsite={isAnalyzingWebsite}
              websiteAnalysisResults={websiteAnalysisResults}
              handleBusinessSearch={handleBusinessSearch}
              handleSelectBusinessResult={handleSelectBusinessResult}
              analyzeWebsite={analyzeWebsite}
            />
          )}

          {currentStep === 2 && (
            <Step2ToneIndustry
              tone={tone}
              setTone={setTone}
              industry={industry}
              setIndustry={setIndustry}
              toneOptions={toneOptions}
              industryOptions={industryOptions}
            />
          )}

          {currentStep === 3 && (
            <Step3ColorPalette
              palette={palette}
              setPalette={setPalette}
              paletteOptions={paletteOptions}
            />
          )}

          {currentStep === 4 && (
            <Step4ReferenceWebsites
              inspirationUrl={inspirationUrl}
              setInspirationUrl={setInspirationUrl}
            />
          )}

          {enableSeoMode && currentStep === 5 && (
            <Step5BusinessInfo
              businessData={businessData}
              updateBusinessData={updateBusinessData}
              websiteAnalysisResults={websiteAnalysisResults}
            />
          )}

          {enableSeoMode && currentStep === 6 && (
            <Step6SeoStrategy
              businessData={businessData}
              addToArray={addToArray}
              removeFromArray={removeFromArray}
            />
          )}

          {!enableSeoMode && currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Reference Websites (Optional)
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Add URLs for inspiration or to replace an existing site.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <GlobeIcon className="w-4 h-4 inline mr-1" />
                    Current Website to Replace
                  </label>
                  <Input
                    value={oldSiteUrl}
                    onChange={setOldSiteUrl}
                    placeholder="https://your-current-site.com"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    We'll analyze your current site to preserve important content and structure.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <SparklesIcon className="w-4 h-4 inline mr-1" />
                    Inspiration Website
                  </label>
                  <Input
                    value={inspirationUrl}
                    onChange={setInspirationUrl}
                    placeholder="https://inspiration-site.com"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    A site you admire that we can use as design inspiration.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>Note:</strong> These URLs are optional but can significantly improve the quality and relevance of your generated page.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                icon={<ChevronLeftIcon className="w-4 h-4" />}
              >
                Previous
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem('generationWizard');
                  window.location.reload();
                }}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear Form
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              {enableSeoMode && (
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {currentStep <= 4 ? 'Basic Setup' : 'SEO Optimization'}
                </div>
              )}
              
              <div className="text-xs text-green-600 dark:text-green-400">
                ✓ Form data saved
              </div>
              
              <div className="flex space-x-3">
                {currentStep < totalSteps ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    icon={<ChevronRightIcon className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {enableSeoMode && currentStep === 4 ? 'Continue to SEO Setup' : 'Next'}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {isLoading && generationStatus && (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {generationStatus}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          This may take a few moments...
                        </div>
                      </div>
                    )}
                    <Button
                      variant="primary"
                      onClick={handleGenerate}
                      disabled={isLoading || !canProceed()}
                      loading={isLoading}
                      icon={!isLoading && <SparklesIcon className="w-4 h-4" />}
                      className="w-full"
                    >
                      {isLoading 
                        ? 'Generating...' 
                        : (enableSeoMode ? 'Generate SEO-Optimized Page' : 'Generate Page')
                      }
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Intelligence Dashboard Modal */}
      {showBusinessIntelligence && (
        <BusinessIntelligenceDashboard
          businessName={businessData.businessName}
          domain={businessData.website}
          onClose={() => setShowBusinessIntelligence(false)}
        />
      )}
    </div>
  );
};

export default GenerationWizard;
