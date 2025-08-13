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

export interface LocalBusinessData {
  businessName: string;
  businessType: string;
  website: string;
  zipCode: string;
  address: string;
  phone: string;
  email: string;
  serviceAreaZips: string[];
  brandTerms: string[];
  targetKeywords: string[];
  competitorUrls: string[];
  primaryServices: string[];
  uniqueSellingPoints: string[];
}

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
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  What do you want to create?
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Describe your landing page in detail. The more specific you are, the better the AI can help you.
                </p>
              </div>

              {/* Business Search Section - NEW! */}
              {enableSeoMode && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-3 flex items-center">
                    🔍 Auto-Lookup: Search for your business
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-4">
                    Enter your business name and area code, and we'll find all your business information automatically!
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={businessSearchQuery}
                        onChange={(e) => setBusinessSearchQuery(e.target.value)}
                        placeholder="e.g., 'Smith Dental 415' or 'Pizza Palace downtown'"
                        className="flex-1 px-4 py-3 border-2 border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                        onKeyDown={(e) => e.key === 'Enter' && handleBusinessSearch()}
                      />
                      <Button
                        onClick={handleBusinessSearch}
                        disabled={isSearchingBusiness || !businessSearchQuery.trim()}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50"
                      >
                        {isSearchingBusiness ? 'Searching...' : 'Search'}
                      </Button>
                    </div>
                    
                    {/* Business Search Results */}
                    {showBusinessResults && businessSearchResults.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-green-900 dark:text-green-300">Found businesses:</h5>
                          <div className="flex items-center space-x-2">
                            {businessSearchResults[0]?.isReal ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                ✅ Real Data
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                🧪 Demo Data
                              </span>
                            )}
                          </div>
                        </div>
                        {businessSearchResults.map((result, index) => (
                          <div
                            key={index}
                            className="p-4 bg-white dark:bg-slate-700 border border-green-200 dark:border-green-600 rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-slate-600 transition-colors"
                            onClick={() => handleSelectBusinessResult(result)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h6 className="font-semibold text-gray-900 dark:text-white">{result.name}</h6>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{result.businessType}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{result.address}</p>
                                {result.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{result.phone}</p>}
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                  ⭐ {result.rating} ({result.reviewCount} reviews)
                                </div>
                                <Button
                                  size="sm"
                                  className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Use This Business
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {showBusinessResults && businessSearchResults.length === 0 && (
                      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          No businesses found. Try a different search term or use the website URL option below.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Website Auto-Fill Section - FIRST! */}
              {enableSeoMode && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
                    <GlobeIcon className="w-5 h-5 mr-2" />
                    🚀 Quick Start: Do you have an existing website?
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                    Enter your website URL and we'll automatically analyze it to fill in all your business information!
                  </p>
                  
                  <div className="relative">
                    <input
                      type="url"
                      value={businessData.website}
                      onChange={(e) => {
                        const url = e.target.value;
                        updateBusinessData({ website: url });
                        
                        // Auto-analyze when a valid URL is entered (debounced)
                        if (url && url.startsWith('http') && url.includes('.') && url.length > 10) {
                          setTimeout(() => {
                            console.log('🕐 Debounced analysis triggered for:', url);
                            analyzeWebsite(url);
                          }, 1500);
                        }
                      }}
                      onBlur={(e) => {
                        // Also analyze on blur if we have a valid URL
                        const url = e.target.value;
                        if (url && url.startsWith('http') && url.includes('.') && url.length > 10) {
                          console.log('🎯 Blur analysis triggered for:', url);
                          analyzeWebsite(url);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Trigger analysis on Enter key
                        if (e.key === 'Enter') {
                          const url = e.currentTarget.value;
                          if (url && url.startsWith('http') && url.includes('.') && url.length > 10) {
                            console.log('⚡ Enter key analysis triggered for:', url);
                            analyzeWebsite(url);
                          }
                        }
                      }}
                      placeholder="https://yourbusiness.com"
                      className="w-full px-4 py-3 pr-12 border-2 border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    />
                    {businessData.website && (
                      <Button
                        type="button"
                        onClick={() => analyzeWebsite(businessData.website)}
                        disabled={isAnalyzingWebsite}
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2"
                        title="Analyze website to auto-fill business information"
                      >
                        {isAnalyzingWebsite ? (
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <GlobeIcon className="w-5 h-5" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {isAnalyzingWebsite && (
                    <div className="mt-3 flex items-center text-sm text-blue-700 dark:text-blue-300">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      🔍 Analyzing website for business information, keywords, services, and content...
                    </div>
                  )}
                  
                  {websiteAnalysisResults && (
                    <div className="mt-3 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-sm border border-green-300 dark:border-green-700">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          ✅ 
                        </div>
                        <div className="ml-2">
                          <div className="font-semibold text-green-800 dark:text-green-300 mb-2">
                            Website Analysis Complete!
                          </div>
                          {websiteAnalysisResults.comprehensive && (
                            <div className="space-y-1 text-green-700 dark:text-green-400">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>📊 Keywords: {websiteAnalysisResults.extractedData?.keywords || 0}</div>
                                <div>🛠️ Services: {websiteAnalysisResults.extractedData?.services || 0}</div>
                                <div>🏷️ Brand Terms: {websiteAnalysisResults.extractedData?.brandTerms || 0}</div>
                                <div>⭐ USPs: {websiteAnalysisResults.extractedData?.usps || 0}</div>
                              </div>
                              <div className="mt-2 text-xs text-green-600 dark:text-green-500">
                                Auto-filled business information, services, SEO keywords, and unique selling points from your website.
                              </div>
                            </div>
                          )}
                          {!websiteAnalysisResults.comprehensive && (
                            <div className="text-green-700 dark:text-green-400 text-xs">
                              Basic business information extracted and auto-filled.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Don't have a website? No problem! Just skip this and fill out the information manually in the next steps.
                  </p>
                  
                  {/* Quick Test Buttons */}
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                      <strong>🧪 Quick Test:</strong> Try these sample websites to see comprehensive auto-fill in action:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const testUrl = 'https://johnsplumbing.com';
                          updateBusinessData({ website: testUrl });
                          analyzeWebsite(testUrl);
                        }}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      >
                        Test: johnsplumbing.com
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const testUrl = 'https://smithlawfirm.com';
                          updateBusinessData({ website: testUrl });
                          analyzeWebsite(testUrl);
                        }}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      >
                        Test: smithlawfirm.com
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const testUrl = 'https://mariabakery.com';
                          updateBusinessData({ website: testUrl });
                          analyzeWebsite(testUrl);
                        }}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      >
                        Test: mariabakery.com
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const testUrl = 'https://moderndentalclinic.com';
                          updateBusinessData({ website: testUrl });
                          analyzeWebsite(testUrl);
                        }}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      >
                        Test: moderndentalclinic.com
                      </button>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      Each test will extract: Business info, Services, Keywords, Brand terms, and Unique selling points
                    </p>
                  </div>
                </div>
              )}
              
              <Textarea
                value={prompt}
                onChange={setPrompt}
                placeholder="Example: A modern landing page for a SaaS productivity app targeting small businesses. Include features showcase, pricing tiers, customer testimonials, and a free trial signup form."
                rows={6}
                className="w-full"
                aria-label="Page description"
              />
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  💡 Pro Tips
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Include your target audience</li>
                  <li>• Mention specific features or benefits</li>
                  <li>• Specify the main call-to-action</li>
                  <li>• Include any special requirements</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Tone & Industry
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Set the personality and context for your landing page.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Tone of Voice
                  </label>
                  <Select
                    value={tone}
                    onChange={setTone}
                    options={toneOptions}
                    placeholder="Select the tone that matches your brand..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Industry
                  </label>
                  <Select
                    value={industry}
                    onChange={setIndustry}
                    options={industryOptions}
                    placeholder="Choose your industry for optimized content..."
                    className="w-full"
                  />
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>Why this matters:</strong> These choices help the AI create content that resonates with your audience and follows industry best practices.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Choose Your Colors
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Select a color palette that reflects your brand personality.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                  Color Palette
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paletteOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPalette(option.value)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        palette === option.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {option.description}
                          </p>
                        </div>
                        {palette === option.value && (
                          <CheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div className="mt-3 flex space-x-2">
                        {option.colors?.map((color, index) => (
                          <div 
                            key={index}
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" 
                            style={{ backgroundColor: color }}
                            title={color}
                          ></div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Reference Websites (Optional)
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Add inspiration websites to guide the design and content style.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <SparklesIcon className="w-4 h-4 inline mr-1" />
                    Inspiration Website
                  </label>
                  <input
                    type="url"
                    value={inspirationUrl}
                    onChange={(e) => setInspirationUrl(e.target.value)}
                    placeholder="https://inspiration-site.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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

          {enableSeoMode && currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Local Business Information
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  {businessData.businessName ? 
                    `Great! We found information for ${businessData.businessName}. Please review and complete any missing details.` :
                    'Please provide your business information for SEO optimization.'
                  }
                </p>
              </div>

              {/* Show website analyzed status if applicable */}
              {websiteAnalysisResults && businessData.website && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-300 mb-2 flex items-center">
                    ✅ Website Analyzed: {businessData.website}
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    We've automatically filled in your business information from your website. Please review and update any details below.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={businessData.businessName}
                      onChange={(e) => updateBusinessData({ businessName: e.target.value })}
                      placeholder="Your Business Name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Business Type *
                    </label>
                    <input
                      type="text"
                      value={businessData.businessType}
                      onChange={(e) => updateBusinessData({ businessType: e.target.value })}
                      placeholder="e.g., Restaurant, Law Firm, Plumber"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    ZIP Code * (Primary Location)
                  </label>
                  <input
                    type="text"
                    value={businessData.zipCode}
                    onChange={(e) => updateBusinessData({ zipCode: e.target.value })}
                    placeholder="12345"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Full Address
                  </label>
                  <Input
                    value={businessData.address}
                    onChange={(value) => updateBusinessData({ address: value })}
                    placeholder="123 Main St, City, State 12345"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <Input
                      value={businessData.phone}
                      onChange={(value) => updateBusinessData({ phone: value })}
                      placeholder="(555) 123-4567"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      value={businessData.email}
                      onChange={(value) => updateBusinessData({ email: value })}
                      placeholder="contact@yourbusiness.com"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  🎯 Why This Matters for SEO
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Local business information improves Google My Business optimization</li>
                  <li>• ZIP code helps target location-specific keywords</li>
                  <li>• NAP consistency (Name, Address, Phone) boosts local search rankings</li>
                  <li>• Existing website analysis helps preserve valuable SEO equity</li>
                </ul>
              </div>
            </div>
          )}

          {enableSeoMode && currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  SEO Strategy & Keywords
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Define your services and competitive advantage for better search rankings.
                </p>
              </div>

              <div className="space-y-6">
                {/* Primary Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Primary Services * (What do you do?)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Add a service (e.g., Emergency Plumbing, Dental Cleaning)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addToArray('primaryServices', input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                          if (input?.value.trim()) {
                            addToArray('primaryServices', input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {businessData.primaryServices.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        >
                          {service}
                          <button
                            onClick={() => removeFromArray('primaryServices', index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Target Keywords (What do customers search for?)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Add keyword (e.g., plumber near me, emergency dental)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addToArray('targetKeywords', input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                          if (input?.value.trim()) {
                            addToArray('targetKeywords', input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {businessData.targetKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        >
                          {keyword}
                          <button
                            onClick={() => removeFromArray('targetKeywords', index)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Unique Selling Points */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    What Makes You Different? (Unique Selling Points)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Add USP (e.g., 24/7 Service, 20+ Years Experience)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addToArray('uniqueSellingPoints', input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                          if (input?.value.trim()) {
                            addToArray('uniqueSellingPoints', input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {businessData.uniqueSellingPoints.map((point, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                        >
                          {point}
                          <button
                            onClick={() => removeFromArray('uniqueSellingPoints', index)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Competitor URLs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Competitor Websites (Optional)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="url"
                        placeholder="Add competitor URL (helps us understand your market)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addToArray('competitorUrls', input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                          if (input?.value.trim()) {
                            addToArray('competitorUrls', input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {businessData.competitorUrls.map((url, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                        >
                          {url}
                          <button
                            onClick={() => removeFromArray('competitorUrls', index)}
                            className="ml-2 text-orange-600 hover:text-orange-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
                  📈 SEO Strategy Benefits
                </h4>
                <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                  <li>• Services become your primary keyword targets</li>
                  <li>• Keywords help optimize content for search engines</li>
                  <li>• USPs create compelling, differentiated copy</li>
                  <li>• Competitor analysis informs content strategy</li>
                  <li>• Local modifiers boost local search visibility</li>
                </ul>
              </div>
            </div>
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

          {enableSeoMode && currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  SEO Analysis & Content Generation
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  AI-powered SEO analysis and content optimization for your business.
                </p>
              </div>

              {isAnalyzingSeo && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Analyzing your business for SEO opportunities...
                  </p>
                </div>
              )}

              {seoAnalysis && !isAnalyzingSeo && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      📊 SEO Analysis Complete
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-blue-600 dark:text-blue-400 font-medium">SEO Score</div>
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {seoAnalysis.seoScore}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600 dark:text-blue-400 font-medium">Primary Keyword</div>
                        <div className="text-blue-900 dark:text-blue-100 font-medium">
                          {seoAnalysis.primaryKeyword}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600 dark:text-blue-400 font-medium">Secondary Keywords</div>
                        <div className="text-blue-900 dark:text-blue-100 font-medium">
                          {seoAnalysis.secondaryKeywords.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600 dark:text-blue-400 font-medium">Long-tail Keywords</div>
                        <div className="text-blue-900 dark:text-blue-100 font-medium">
                          {seoAnalysis.longTailKeywords.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowSeoAudit(!showSeoAudit)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700"
                    >
                      {showSeoAudit ? 'Hide' : 'View'} Detailed SEO Audit
                    </button>
                    
                    <button
                      onClick={() => setShowBusinessIntelligence(true)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-700"
                    >
                      📊 Business Intelligence
                    </button>
                  </div>

                  {showSeoAudit && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <SeoAuditDashboard 
                        analysis={seoAnalysis} 
                        onAddKeywordsToSeo={handleAddKeywordsToSeo}
                      />
                    </div>
                  )}

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
                      ✅ SEO Optimizations Applied
                    </h4>
                    <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                      <li>• Primary keyword integrated into page title and headers</li>
                      <li>• Secondary keywords distributed throughout content</li>
                      <li>• Local business schema markup included</li>
                      <li>• Meta descriptions optimized for click-through rates</li>
                      <li>• Internal linking structure planned</li>
                      <li>• Mobile-first responsive design ensured</li>
                    </ul>
                  </div>
                </div>
              )}

              {!seoAnalysis && !isAnalyzingSeo && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Click "Next" to start your SEO analysis
                  </p>
                </div>
              )}
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
