import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-your-openai-key-here',
});

export async function askGPT(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Validate API key format (sk-...)
    if (!apiKey || !apiKey.startsWith('sk-') || apiKey === 'sk-your-openai-key-here') {
      console.warn('Invalid or missing OpenAI API key');
      return 'Market analysis temporarily unavailable. Please configure a valid OpenAI API key.';
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional forex market analyst. Provide concise, accurate analysis based on the given data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('GPT API Error:', error);
    if (error instanceof Error && error.message.includes('API key')) {
      return 'Market analysis temporarily unavailable. Please check API key configuration.';
    }
    return 'Failed to generate market analysis. Please try again later.';
  }
}