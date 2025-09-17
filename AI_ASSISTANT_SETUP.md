# AI Assistant Configuration

The Clothify-Catalogue now includes an AI assistant powered by **OpenRouter** and **OpenAI GPT-4** to help users with shopping questions, product recommendations, sizing advice, and general clothing guidance.

## ✅ Current Status: ACTIVE with GPT-4

The AI assistant is currently configured with OpenRouter to use real OpenAI models (GPT-4o-mini) for intelligent, contextual responses about fashion and shopping.

## Features

- **Real AI Responses**: Powered by OpenAI GPT-4 through OpenRouter
- **Fashion Expertise**: Specialized knowledge in clothing, styling, and fashion trends
- **Intelligent Conversations**: Context-aware responses with follow-up questions
- **Responsive Design**: Beautiful chat interface that works on all devices
- **Smooth Animations**: Professional typing indicators and message transitions

## API Configuration

The AI assistant is configured to use **OpenRouter** which provides access to OpenAI's GPT-4 models with competitive pricing and reliability.

### OpenRouter Setup (Current Configuration)

Add your OpenRouter API key to your `.env` file:

```env
# AI Assistant Configuration - OpenRouter
VITE_AI_API_URL=https://openrouter.ai/api/v1/chat/completions
VITE_AI_API_KEY=your_openrouter_api_key_here
VITE_SITE_URL=https://your-site.com
VITE_SITE_NAME=Clothify Catalogue
```

**Get your OpenRouter API key:**
1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Go to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Add it to your `.env` file

**Benefits of OpenRouter:**
- Access to GPT-4, GPT-4-turbo, and other premium models
- Competitive pricing (often cheaper than direct OpenAI)
- High reliability and uptime
- No waitlists or restrictions
- Usage tracking and analytics

## Supported AI Services

The assistant is designed to work with OpenAI-compatible APIs:

### OpenAI (Recommended)
- **API URL**: `https://api.openai.com/v1/chat/completions`
- **Models**: `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo`
- **Setup**: Get your API key from [OpenAI Platform](https://platform.openai.com/)

### Azure OpenAI
- **API URL**: `https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-12-01-preview`
- **Authentication**: Use `api-key` header

### Other Compatible Services
- **Anthropic Claude** (via proxy)
- **Local LLMs** (Ollama, LM Studio, etc.)
- **Custom APIs** that follow OpenAI chat completion format

## Fallback Mode

If no API is configured, the assistant will use intelligent fallback responses for common shopping questions:

- Size and fitting advice
- Product recommendations
- Return and shipping information
- Styling tips
- General shopping assistance

## Customization

### Assistant Personality

You can customize the assistant's personality by modifying the system prompt in `src/contexts/AIContext.tsx`:

```typescript
const systemContext = {
  role: 'system',
  content: `You are a helpful shopping assistant for Clothify, an online clothing store...`
};
```

### Styling

The assistant uses Tailwind CSS and can be customized by modifying `src/components/AIAssistant.tsx`. Key design elements:

- Accent color theme matching your brand
- Responsive design with mobile-first approach
- Smooth animations and transitions
- Accessible design with proper contrast

### Position and Behavior

You can modify the assistant's position and behavior:

```tsx
// Change position
<AIAssistant className=\"bottom-4 right-4\" />

// Or integrate into a different location
<AIAssistant className=\"relative\" />
```

## Usage Examples

Users can ask the assistant about:

- **\"What size should I order for a medium t-shirt?\"**
- **\"Can you recommend a dress for a wedding?\"**
- **\"What's your return policy?\"**
- **\"How do I style a blazer casually?\"**
- **\"What colors go well with navy blue?\"**

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Rate Limiting**: Consider implementing rate limiting for API calls
3. **Content Filtering**: The assistant includes basic content filtering
4. **User Privacy**: Conversations are not stored permanently

## Troubleshooting

### Assistant Not Responding
- Check API key configuration
- Verify API URL is correct
- Check network connectivity
- Review browser console for errors

### Slow Responses
- Consider using faster models (gpt-3.5-turbo vs gpt-4)
- Reduce maxTokens setting
- Check API service status

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS styles
- Verify responsive breakpoints

## Development

To extend the AI assistant:

1. **Add new intents** in the fallback response system
2. **Integrate with product database** for real-time recommendations
3. **Add conversation history** persistence
4. **Implement user feedback** collection
5. **Add voice input/output** capabilities

## Performance

The AI assistant is optimized for performance:

- Lazy loading of chat interface
- Efficient state management
- Minimal bundle impact
- Graceful fallbacks

---

**Need help?** The AI assistant is ready to help your customers with their shopping questions!
