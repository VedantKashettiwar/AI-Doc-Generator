const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = null;
  }

  /**
   * Initialize OpenAI client
   */
  initializeOpenAI() {
    if (!this.openai) {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
        throw new Error('OPENAI_API_KEY is not configured properly. Please set a valid API key in your .env file.');
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.openai;
  }

  /**
   * Generate structured documentation from markdown content
   * @param {string} markdownContent - The markdown content to process
   * @returns {Object} Structured documentation
   */
  async generateDocumentation(markdownContent) {
    try {
      const openai = this.initializeOpenAI();
      const prompt = this.buildPrompt(markdownContent);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a senior software engineer specializing in creating clear, structured technical documentation. Respond with a professional, human-readable document using Markdown format. Do NOT use JSON. Use headings, bullet points, and code blocks where appropriate."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      
      // Return the formatted document directly
      return response;

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  /**
   * Build the prompt for OpenAI
   * @param {string} markdownContent - The markdown content
   * @returns {string} The formatted prompt
   */
  buildPrompt(markdownContent) {
    return `You are a senior software engineer. Given the following markdown content of a backend module, generate structured documentation.

Markdown Content:
${markdownContent}

Please analyze this markdown and return a well-formatted technical document with the following structure:

# Module Documentation

## Module Summary
[A concise summary of what this module does]

## Key Features
- [Feature 1]
- [Feature 2]
- [Feature 3]

## Inputs & Outputs

### Inputs
- [Input 1]
- [Input 2]

### Outputs
- [Output 1]
- [Output 2]

## Dependencies
- [Dependency 1]
- [Dependency 2]

## Important Notes
- [Important note 1]
- [Important note 2]

Please provide a clean, professional document format that can be easily read and understood. Use Markdown, not JSON.`;
  }
}

module.exports = new AIService(); 