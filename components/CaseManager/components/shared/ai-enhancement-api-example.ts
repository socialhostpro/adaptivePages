/**
 * AI Text Enhancement API Example
 * This would integrate with your existing Gemini API setup
 */

// Example API endpoint structure for text enhancement
// Place this in your API routes (e.g., pages/api/ai/enhance-text.ts for Next.js)

export interface EnhanceTextRequest {
  text: string;
  type: 'grammar' | 'professional' | 'casual' | 'technical' | 'legal' | 'custom';
  prompt?: string;
}

export interface EnhanceTextResponse {
  enhancedText: string;
  originalText: string;
  enhancementType: string;
  success: boolean;
}

// Example implementation using your existing Gemini setup
export async function enhanceTextWithGemini(request: EnhanceTextRequest): Promise<EnhanceTextResponse> {
  const prompts = {
    grammar: 'Fix grammar, spelling, and punctuation errors in the following text while maintaining the original meaning and tone. Return only the corrected text:',
    professional: 'Rewrite the following text in a professional, business-appropriate tone while maintaining the original meaning. Return only the rewritten text:',
    casual: 'Rewrite the following text in a casual, friendly, conversational tone while maintaining the original meaning. Return only the rewritten text:',
    technical: 'Rewrite the following text in a clear, technical style appropriate for documentation, using precise terminology. Return only the rewritten text:',
    legal: 'Rewrite the following text using appropriate legal language and terminology while maintaining clarity. Return only the rewritten text:',
    custom: request.prompt || 'Improve the following text:'
  };

  const systemPrompt = prompts[request.type];
  const fullPrompt = `${systemPrompt}\n\nOriginal text: "${request.text}"\n\nEnhanced text:`;

  try {
    // Use your existing Gemini API integration
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        maxTokens: 500,
        temperature: 0.3 // Lower temperature for more consistent text enhancement
      })
    });

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const result = await response.json();
    const enhancedText = result.text?.trim() || request.text;

    return {
      enhancedText,
      originalText: request.text,
      enhancementType: request.type,
      success: true
    };
  } catch (error) {
    console.error('Text enhancement error:', error);
    return {
      enhancedText: request.text, // Return original text on error
      originalText: request.text,
      enhancementType: request.type,
      success: false
    };
  }
}

// Example Next.js API route handler
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text, type, customPrompt } = req.body;

    if (!text || !type) {
      return res.status(400).json({ message: 'Text and type are required' });
    }

    const result = await enhanceTextWithGemini({
      text,
      type,
      prompt: customPrompt
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
