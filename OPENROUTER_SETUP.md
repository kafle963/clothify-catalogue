# OpenRouter API Key Setup Instructions

## Quick Setup Guide

To activate the AI assistant with real GPT-4 responses, you need to add your OpenRouter API key:

### Step 1: Get Your OpenRouter API Key

1. **Visit OpenRouter**: Go to [https://openrouter.ai](https://openrouter.ai)
2. **Sign Up**: Create a free account
3. **Get API Key**: Navigate to [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. **Create Key**: Click \"Create Key\" and copy the generated key

### Step 2: Add API Key to Your Project

Open your `.env` file and replace `<OPENROUTER_API_KEY>` with your actual API key:

```env
# AI Assistant Configuration - OpenRouter
VITE_AI_API_URL=https://openrouter.ai/api/v1/chat/completions
VITE_AI_API_KEY=sk-or-v1-your-actual-key-here
VITE_SITE_URL=https://clothify-catalogue.com
VITE_SITE_NAME=Clothify Catalogue
```

### Step 3: Restart Development Server

After updating the `.env` file, restart your development server:

```bash
npm run dev
```

## \u2728 What You'll Get

- **Real AI Responses**: Powered by OpenAI GPT-4o-mini
- **Fashion Expertise**: Specialized in clothing and styling advice
- **Smart Conversations**: Context-aware responses that understand your clothing store
- **Cost Effective**: OpenRouter often provides better pricing than direct OpenAI

## Example Conversations

Once configured, your customers can ask:

- *\"What size dress should I order if I'm usually a medium?\"*
- *\"Can you help me style a navy blazer for a business meeting?\"*
- *\"What's trending in women's fashion this season?\"*
- *\"I need a casual outfit for a weekend brunch, any suggestions?\"*

## Pricing

OpenRouter charges per token used:
- **GPT-4o-mini**: ~$0.15 per 1M input tokens
- **GPT-4**: ~$30 per 1M input tokens
- **Free tier**: Usually includes some free credits to get started

## Troubleshooting

### API Key Issues
- Make sure your API key starts with `sk-or-v1-`
- Verify the key is active at [https://openrouter.ai/keys](https://openrouter.ai/keys)
- Check that you have sufficient credits in your OpenRouter account

### Connection Issues
- Ensure your `.env` file is in the project root
- Restart the development server after making changes
- Check browser console for any error messages

### Rate Limiting
- OpenRouter has generous rate limits
- If you hit limits, wait a moment or upgrade your plan

---

**Ready to activate real AI responses? Just add your OpenRouter API key and start chatting!** \ud83d�\ud83e�dd16
