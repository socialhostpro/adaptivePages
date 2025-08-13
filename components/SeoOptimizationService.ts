import type { LocalBusinessData } from './GenerationWizard';

// Mock SEO analysis and optimization service
export interface SeoAnalysis {
  seoScore: number; // 0-100
  primaryKeyword: string;
  secondaryKeywords: string[];
  longTailKeywords: string[];
  questionKeywords: string[];
  recommendations: SeoRecommendation[];
  localSeoFactors: LocalSeoFactor[];
  competitorInsights: CompetitorInsight[];
}

export interface SeoRecommendation {
  category: 'content' | 'technical' | 'local' | 'keywords';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}

export interface LocalSeoFactor {
  factor: string;
  status: 'optimized' | 'needs_improvement' | 'missing';
  description: string;
  recommendation?: string;
}

export interface CompetitorInsight {
  url: string;
  strengths: string[];
  weaknesses: string[];
  keywordGaps: string[];
}

export interface SeoOptimizedSection {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  body: string;
  bullets?: string[];
  cta: {
    label: string;
    href: string;
  };
  tags: string[];
  keywords: string[];
  embeddingText: string;
  previewExcerpt: string;
  seo: {
    h1?: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
    ogTitle: string;
    ogDescription: string;
    ogImagePrompt: string;
  };
  internalLinks: string[];
  schema: Record<string, any>;
}

// Mock implementation of SEO optimization service
export class SeoOptimizationService {
  static async analyzeBusiness(businessData: LocalBusinessData): Promise<SeoAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock keyword analysis based on business type and location
    const businessType = businessData.businessType.toLowerCase();
    const location = businessData.zipCode;
    const locationModifiers = this.getLocationModifiers(location);

    // Generate primary keyword
    const primaryKeyword = `${businessType} ${locationModifiers[0]}`;

    // Generate secondary keywords
    const secondaryKeywords = [
      ...businessData.primaryServices.map(service => `${service} ${locationModifiers[0]}`),
      `best ${businessType} ${locationModifiers[1]}`,
      `${businessType} services ${locationModifiers[0]}`,
      `local ${businessType}`
    ].slice(0, 8);

    // Generate long-tail keywords
    const longTailKeywords = [
      `affordable ${businessType} ${locationModifiers[0]}`,
      `professional ${businessType} services ${locationModifiers[1]}`,
      `${businessType} ${locationModifiers[0]} reviews`,
      `24/7 ${businessType} ${locationModifiers[0]}`,
      ...businessData.uniqueSellingPoints.map(usp => 
        `${businessType} ${usp.toLowerCase()} ${locationModifiers[0]}`
      )
    ].slice(0, 15);

    // Generate question keywords
    const questionKeywords = [
      `how to find ${businessType} ${locationModifiers[0]}`,
      `what is the best ${businessType} ${locationModifiers[1]}`,
      `how much does ${businessType} cost ${locationModifiers[0]}`,
      `why choose ${businessType} ${locationModifiers[0]}`,
      `when to call ${businessType}`
    ];

    // Generate recommendations
    const recommendations: SeoRecommendation[] = [
      {
        category: 'content',
        priority: 'high',
        title: 'Optimize Homepage Title',
        description: `Include primary keyword "${primaryKeyword}" in page title`,
        impact: 'Can improve search rankings by 15-25%'
      },
      {
        category: 'local',
        priority: 'high',
        title: 'Add Local Schema Markup',
        description: 'Include LocalBusiness schema with NAP information',
        impact: 'Improves local search visibility and rich snippets'
      },
      {
        category: 'content',
        priority: 'medium',
        title: 'Create Service-Specific Pages',
        description: 'Build dedicated pages for each primary service',
        impact: 'Targets long-tail keywords and improves user experience'
      },
      {
        category: 'technical',
        priority: 'medium',
        title: 'Optimize Page Speed',
        description: 'Compress images and minimize CSS/JS',
        impact: 'Page speed is a ranking factor for mobile searches'
      }
    ];

    // Generate local SEO factors
    const localSeoFactors: LocalSeoFactor[] = [
      {
        factor: 'NAP Consistency',
        status: businessData.address && businessData.phone ? 'optimized' : 'needs_improvement',
        description: 'Name, Address, Phone consistency across web',
        recommendation: !businessData.address ? 'Add complete business address' : undefined
      },
      {
        factor: 'Google My Business',
        status: 'needs_improvement',
        description: 'Google Business Profile optimization',
        recommendation: 'Claim and optimize Google Business Profile'
      },
      {
        factor: 'Local Keywords',
        status: 'optimized',
        description: 'Location-based keyword targeting'
      },
      {
        factor: 'Local Citations',
        status: 'missing',
        description: 'Business listings in local directories',
        recommendation: 'Submit to local business directories'
      }
    ];

    // Mock competitor insights
    const competitorInsights: CompetitorInsight[] = businessData.competitorUrls.map(url => ({
      url,
      strengths: ['Strong local presence', 'Good review volume'],
      weaknesses: ['Slow website', 'Limited service descriptions'],
      keywordGaps: [`emergency ${businessType}`, `certified ${businessType}`]
    }));

    return {
      seoScore: 72,
      primaryKeyword,
      secondaryKeywords,
      longTailKeywords,
      questionKeywords,
      recommendations,
      localSeoFactors,
      competitorInsights
    };
  }

  static async generateSeoOptimizedSections(
    businessData: LocalBusinessData,
    seoAnalysis: SeoAnalysis
  ): Promise<SeoOptimizedSection[]> {
    // Simulate content generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const sections: SeoOptimizedSection[] = [];
    const { primaryKeyword, secondaryKeywords } = seoAnalysis;
    const businessName = businessData.businessName;

    // Hero Section
    sections.push({
      id: 'hero',
      type: 'hero',
      title: `${businessName} - ${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)}`,
      subtitle: `Professional ${businessData.businessType} services in your area. ${businessData.uniqueSellingPoints[0] || 'Fast, reliable, and affordable'}.`,
      body: `Looking for trusted ${businessData.businessType} services? ${businessName} provides top-quality ${businessData.primaryServices.join(', ')} with a focus on customer satisfaction and professional results.`,
      bullets: businessData.uniqueSellingPoints.slice(0, 3),
      cta: {
        label: 'Get Free Quote',
        href: '#contact'
      },
      tags: ['hero', 'primary-cta', 'business-intro'],
      keywords: [primaryKeyword, ...secondaryKeywords.slice(0, 2)],
      embeddingText: `${businessName} is a professional ${businessData.businessType} serving ${businessData.zipCode}. We specialize in ${businessData.primaryServices.join(', ')} with ${businessData.uniqueSellingPoints.join(', ')}. Our expert team provides reliable, affordable services with a commitment to customer satisfaction.`,
      previewExcerpt: `${businessName} - Professional ${businessData.businessType} services. ${businessData.uniqueSellingPoints[0] || 'Fast, reliable, affordable'}. Get your free quote today!`,
      seo: {
        h1: `${businessName} - ${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)}`,
        metaTitle: `${businessName} | ${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)}`,
        metaDescription: `Professional ${businessData.businessType} services in ${businessData.zipCode}. ${businessData.uniqueSellingPoints[0] || 'Fast, reliable, affordable'}. Call for free quote!`,
        slug: 'home',
        ogTitle: `${businessName} - Top ${businessData.businessType} Services`,
        ogDescription: `Quality ${businessData.businessType} services with ${businessData.uniqueSellingPoints[0] || 'professional results'}. Serving ${businessData.zipCode} area.`,
        ogImagePrompt: `Professional ${businessData.businessType} business storefront or team photo`
      },
      internalLinks: ['#services', '#about', '#contact'],
      schema: {
        '@type': 'LocalBusiness',
        'name': businessName,
        'description': `Professional ${businessData.businessType} services`,
        'telephone': businessData.phone,
        'address': businessData.address
      }
    });

    // Services Section
    sections.push({
      id: 'services',
      type: 'services',
      title: 'Our Services',
      subtitle: `Comprehensive ${businessData.businessType} solutions for all your needs`,
      body: `${businessName} offers a full range of ${businessData.businessType} services designed to meet your specific requirements. Our experienced team uses the latest techniques and equipment to deliver exceptional results.`,
      bullets: businessData.primaryServices,
      cta: {
        label: 'View All Services',
        href: '#contact'
      },
      tags: ['services', 'offerings', 'solutions'],
      keywords: [...businessData.primaryServices.map(service => service.toLowerCase()), ...secondaryKeywords.slice(2, 4)],
      embeddingText: `${businessName} provides comprehensive ${businessData.businessType} services including ${businessData.primaryServices.join(', ')}. We serve customers in ${businessData.zipCode} with professional, reliable solutions tailored to each client's needs.`,
      previewExcerpt: `Full range of ${businessData.businessType} services: ${businessData.primaryServices.slice(0, 2).join(', ')} and more. Professional solutions for all your needs.`,
      seo: {
        metaTitle: `${businessData.businessType} Services | ${businessName}`,
        metaDescription: `Complete ${businessData.businessType} services: ${businessData.primaryServices.slice(0, 2).join(', ')}. Professional solutions in ${businessData.zipCode}. Get quote today!`,
        slug: 'services',
        ogTitle: `Professional ${businessData.businessType} Services`,
        ogDescription: `Comprehensive ${businessData.businessType} solutions including ${businessData.primaryServices.join(', ')}.`,
        ogImagePrompt: `${businessData.businessType} services in action, professional work being performed`
      },
      internalLinks: ['#about', '#contact', '#testimonials'],
      schema: {
        '@type': 'Service',
        'serviceType': businessData.businessType,
        'provider': businessName
      }
    });

    // About Section
    sections.push({
      id: 'about',
      type: 'about',
      title: `About ${businessName}`,
      subtitle: `Your trusted ${businessData.businessType} experts`,
      body: `${businessName} has been serving the ${businessData.zipCode} community with reliable ${businessData.businessType} services. We pride ourselves on ${businessData.uniqueSellingPoints.join(', ').toLowerCase()} and building lasting relationships with our customers through quality work and honest pricing.`,
      bullets: [
        'Licensed and insured professionals',
        'Locally owned and operated',
        'Customer satisfaction guaranteed',
        ...businessData.uniqueSellingPoints.slice(0, 2)
      ],
      cta: {
        label: 'Learn More',
        href: '#contact'
      },
      tags: ['about', 'company', 'trust'],
      keywords: [`local ${businessData.businessType}`, `trusted ${businessData.businessType}`, ...secondaryKeywords.slice(4, 6)],
      embeddingText: `${businessName} is a trusted ${businessData.businessType} company serving ${businessData.zipCode}. We are known for ${businessData.uniqueSellingPoints.join(', ').toLowerCase()} and commitment to customer satisfaction. Our team of licensed professionals provides reliable, quality services.`,
      previewExcerpt: `${businessName} - Your trusted local ${businessData.businessType} experts. Licensed, insured, and committed to customer satisfaction in ${businessData.zipCode}.`,
      seo: {
        metaTitle: `About ${businessName} | Local ${businessData.businessType} Experts`,
        metaDescription: `Learn about ${businessName}, your trusted ${businessData.businessType} experts in ${businessData.zipCode}. Licensed, insured, and customer-focused.`,
        slug: 'about',
        ogTitle: `About ${businessName} - Local ${businessData.businessType} Experts`,
        ogDescription: `Trusted ${businessData.businessType} company serving ${businessData.zipCode} with professional, reliable services.`,
        ogImagePrompt: `${businessName} team photo or business owner portrait`
      },
      internalLinks: ['#services', '#contact', '#testimonials'],
      schema: {
        '@type': 'AboutPage',
        'mainEntity': businessName
      }
    });

    return sections;
  }

  private static getLocationModifiers(zipCode: string): string[] {
    // Mock location detection - in real implementation, would use ZIP code API
    const mockCities = {
      '90210': ['Beverly Hills CA', 'Los Angeles area'],
      '10001': ['New York NY', 'Manhattan area'],
      '60601': ['Chicago IL', 'downtown Chicago'],
      'default': ['near me', 'in your area']
    };

    return mockCities[zipCode as keyof typeof mockCities] || mockCities.default;
  }
}

export default SeoOptimizationService;
