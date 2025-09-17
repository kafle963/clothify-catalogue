import React, { createContext, useContext, useState, useCallback } from 'react';
import { AIContextType, AIMessage, AIConfig } from '@/types';
import { toast } from '@/components/ui/sonner';
import { products } from '@/data/products';

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider: React.FC<{ children: React.ReactNode; config?: AIConfig }> = ({ 
  children, 
  config = {} 
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      content: `Hello! I'm your Clothify shopping assistant. I have access to our ${products.length} products including dresses, shirts, accessories, and more. I can help you with specific product recommendations, size guides, styling tips, and answer any questions about our collection. What are you shopping for today?`,
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Check if API configuration is provided
      const apiUrl = config.apiUrl || import.meta.env.VITE_AI_API_URL;
      const apiKey = config.apiKey || import.meta.env.VITE_AI_API_KEY;
      const siteUrl = import.meta.env.VITE_SITE_URL || 'https://clothify-catalogue.com';
      const siteName = import.meta.env.VITE_SITE_NAME || 'Clothify Catalogue';

      if (!apiUrl) {
        // Fallback to predefined responses if no API configured
        const response = generateFallbackResponse(content);
        
        const assistantMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
        };

        setTimeout(() => {
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Use mock API for demonstration (provides realistic AI-like responses)
      if (apiUrl.includes('jsonplaceholder.typicode.com')) {
        const response = generateEnhancedResponse(content);
        
        const assistantMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
        };

        setTimeout(() => {
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
        }, Math.random() * 1500 + 500); // Simulate realistic API delay
        return;
      }

      // Prepare conversation context
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add system context about Clothify with actual product catalog
      const systemContext = {
        role: 'system',
        content: `You are a helpful and knowledgeable shopping assistant for Clothify, a premium online clothing store. You have access to our current product catalog with ${products.length} items:

${products.map(p => `• ${p.name} - $${p.price}${p.originalPrice ? ` (was $${p.originalPrice})` : ''} - ${p.category} - ${p.description.substring(0, 80)}... Rating: ${p.averageRating}/5 (${p.totalReviews} reviews)`).join('\n')}

When customers ask for recommendations, suggest specific products from our catalog by name and price. Provide helpful details about materials, sizing, styling, and customer reviews. Be friendly, professional, and enthusiastic about helping customers find exactly what they need from our actual inventory.`
      };

      const requestBody = {
        model: config.model || 'openai/gpt-4o-mini', // Using GPT-4o-mini for cost efficiency
        messages: [
          systemContext,
          ...conversationHistory,
          { role: 'user', content }
        ],
        max_tokens: config.maxTokens || 200,
        temperature: config.temperature || 0.7,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': siteUrl, // Required by OpenRouter
          'X-Title': siteName, // Optional but recommended for OpenRouter rankings
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || 'Sorry, I encountered an error. Please try again.';

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI API Error:', error);
      
      let errorMessage = "I'm having trouble connecting right now. ";
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = "API authentication failed. Please check your API key configuration. ";
        } else if (error.message.includes('429')) {
          errorMessage = "API rate limit reached. Please try again in a moment. ";
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = "Network connection issue. Please check your internet connection. ";
        }
      }
      
      // Fallback response on error
      const fallbackMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: errorMessage + "In the meantime, you can browse our products, use the search feature, or check out our categories for men's, women's, kids, and accessories clothing!",
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, fallbackMessage]);
      
      // Only show toast for actual API errors, not when using fallback mode
      const apiUrl = config.apiUrl || import.meta.env.VITE_AI_API_URL;
      const apiKey = config.apiKey || import.meta.env.VITE_AI_API_KEY;
      if (apiUrl && apiKey) {
        toast.error('Connection issue. Using offline assistance.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, config]);

  const clearConversation = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: `Hello! I'm your Clothify shopping assistant. I have access to our ${products.length} products including dresses, shirts, accessories, and more. I can help you with specific product recommendations, size guides, styling tips, and answer any questions about our collection. What are you shopping for today?`,
        role: 'assistant',
        timestamp: new Date(),
      }
    ]);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AIContext.Provider value={{
      messages,
      isLoading,
      isOpen,
      sendMessage,
      clearConversation,
      toggleChat,
      closeChat,
    }}>
      {children}
    </AIContext.Provider>
  );
};

// Enhanced responses that simulate AI-powered assistance with real product data
function generateEnhancedResponse(userInput: string): string {
  const input = userInput.toLowerCase();
  
  // Product-specific recommendations based on actual inventory
  if (input.includes('dress') || input.includes('formal')) {
    const dresses = products.filter(p => p.category === 'Women' && p.name.toLowerCase().includes('dress'));
    if (dresses.length > 0) {
      const recommendations = dresses.map(dress => 
        `• **${dress.name}** - $${dress.price}${dress.originalPrice ? ` (was $${dress.originalPrice})` : ''} - ${dress.description.split('.')[0]}. Rated ${dress.averageRating}/5 stars (${dress.totalReviews} reviews).`
      ).join('\n');
      return `Here are our beautiful dress options:

${recommendations}

Would you like more details about any of these dresses?`;
    }
  }
  
  if (input.includes('men') || input.includes('mens')) {
    const menItems = products.filter(p => p.category === 'Men');
    if (menItems.length > 0) {
      const recommendations = menItems.map(item => 
        `• **${item.name}** - $${item.price} - ${item.description.split('.')[0]}. Available in sizes ${item.sizes.join(', ')}.`
      ).join('\n');
      return `Here are our men's clothing options:\n\n${recommendations}\n\nWhat style or occasion are you shopping for?`;
    }
  }
  
  if (input.includes('women') || input.includes('womens')) {
    const womenItems = products.filter(p => p.category === 'Women');
    if (womenItems.length > 0) {
      const recommendations = womenItems.map(item => 
        `• **${item.name}** - $${item.price}${item.originalPrice ? ` (was $${item.originalPrice})` : ''} - ${item.description.split('.')[0]}. Rated ${item.averageRating}/5 stars.`
      ).join('\n');
      return `Here are our women's clothing options:\n\n${recommendations}\n\nWhat occasion are you shopping for?`;
    }
  }
  
  if (input.includes('accessory') || input.includes('accessories') || input.includes('bag') || input.includes('shoe') || input.includes('sneaker')) {
    const accessories = products.filter(p => p.category === 'Accessories');
    if (accessories.length > 0) {
      const recommendations = accessories.map(item => 
        `• **${item.name}** - $${item.price} - ${item.description.split('.')[0]}. Rated ${item.averageRating}/5 stars.`
      ).join('\n');
      return `Here are our accessory options:

${recommendations}

Which type of accessory interests you most?`;
    }
  }
  
  if (input.includes('sale') || input.includes('discount') || input.includes('deal')) {
    const saleItems = products.filter(p => p.isSale && p.originalPrice);
    if (saleItems.length > 0) {
      const recommendations = saleItems.map(item => 
        `• **${item.name}** - $${item.price} (was $${item.originalPrice}) - Save $${item.originalPrice! - item.price}! ${item.description.split('.')[0]}.`
      ).join('\n');
      return `Here are our current sale items with great savings:

${recommendations}

Don't miss out on these deals!`;
    }
  }
  
  if (input.includes('new') || input.includes('latest') || input.includes('arrival')) {
    const newItems = products.filter(p => p.isNew);
    if (newItems.length > 0) {
      const recommendations = newItems.map(item => 
        `• **${item.name}** - $${item.price} - ${item.description.split('.')[0]}. ${item.category} collection.`
      ).join('\n');
      return `Check out our latest arrivals:

${recommendations}

What catches your eye?`;
    }
  }
  
  if (input.includes('recommend') || input.includes('suggest') || input.includes('help me find')) {
    // Get top-rated products
    const topRated = products.filter(p => p.averageRating >= 4.7).slice(0, 3);
    const recommendations = topRated.map(item => 
      `• **${item.name}** - $${item.price} - ${item.description.split('.')[0]}. Rated ${item.averageRating}/5 stars (${item.totalReviews} reviews).`
    ).join('\n');
    return `Here are our top-rated products I'd recommend:\n\n${recommendations}\n\nWould you like to know more about any of these items?`;
  }
  
  if (input.includes('price') || input.includes('budget') || input.includes('cost')) {
    const priceRanges = {
      under100: products.filter(p => p.price < 100),
      mid: products.filter(p => p.price >= 100 && p.price < 200),
      premium: products.filter(p => p.price >= 200)
    };
    
    return `Here's our price range breakdown:\n\n**Under $100:** ${priceRanges.under100.length} items\n**$100-$199:** ${priceRanges.mid.length} items\n**$200+:** ${priceRanges.premium.length} items\n\nWhat's your budget range? I can show you specific items in that range!`;
  }
  
  // Size and fitting queries with specific product examples
  if (input.includes('size') || input.includes('fit') || input.includes('measurement')) {
    if (input.includes('dress')) {
      const dresses = products.filter(p => p.name.toLowerCase().includes('dress'));
      if (dresses.length > 0) {
        const sizeInfo = dresses[0].sizes.join(', ');
        return `For dresses, we offer sizes ${sizeInfo}. Our ${dresses[0].name} runs true to size. If you're between sizes, go up one size for comfort. Would you like specific measurements for any dress?`;
      }
    }
    if (input.includes('shirt') || input.includes('top')) {
      const shirts = products.filter(p => p.name.toLowerCase().includes('shirt'));
      if (shirts.length > 0) {
        const sizeInfo = shirts[0].sizes.join(', ');
        return `For shirts, we offer sizes ${sizeInfo}. Our ${shirts[0].name} has a modern tailored fit. Cotton items may shrink slightly, so consider sizing up if you prefer looser fit.`;
      }
    }
    return "I'd be happy to help with sizing! Each product page has detailed size charts. Generally, if you're between sizes, we recommend going up one size for comfort. What specific item are you interested in?";
  }
  
  // General product information
  if (input.includes('product') || input.includes('item') || input.includes('clothing') || input.includes('what do you have')) {
    return `We have ${products.length} amazing products in our collection across these categories:

• **Women's:** ${products.filter(p => p.category === 'Women').length} items
• **Men's:** ${products.filter(p => p.category === 'Men').length} items
• **Accessories:** ${products.filter(p => p.category === 'Accessories').length} items
• **Unisex:** ${products.filter(p => p.category === 'Unisex').length} items

What type of clothing are you interested in?`;
  }
  
  // Shopping and policies
  if (input.includes('return') || input.includes('exchange') || input.includes('policy')) {
    return "We offer hassle-free returns within 30 days of purchase. Items should be unworn with original tags. Free return shipping for orders over $75! You can start a return from your order history in your account.";
  }
  
  if (input.includes('shipping') || input.includes('delivery') || input.includes('when will')) {
    return "We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free shipping on orders over $75! You'll receive tracking information once your order ships.";
  }
  
  if (input.includes('discount') || input.includes('sale') || input.includes('promo')) {
    return "Check out our current sales section for amazing deals! We also offer 10% off your first order when you sign up for our newsletter. Follow us for flash sales and exclusive member discounts.";
  }
  
  // Material and care
  if (input.includes('material') || input.includes('fabric') || input.includes('care') || input.includes('wash')) {
    return "All our products include detailed material information and care instructions. Most of our cotton items are machine washable in cold water. For delicate fabrics, we recommend gentle cycle or hand washing. Check the product page for specific care instructions.";
  }
  
  // Seasonal and trends
  if (input.includes('trend') || input.includes('fashion') || input.includes('season')) {
    return "This season, we're loving oversized blazers, high-waisted jeans, and statement accessories. Layering is key for transitional weather. Check out our 'New Arrivals' section for the latest trends!";
  }
  
  // Default enhanced response
  const responses = [
    "I'm here to help you find the perfect outfit! What specific item or style are you looking for today?",
    "Thanks for your question! I can assist with sizing, styling, product recommendations, or any shopping questions. What would you like to know?",
    "Great question! I love helping customers find exactly what they're looking for. Can you tell me more about what you have in mind?",
    "I'm your personal shopping assistant! Whether you need sizing help, style advice, or product recommendations, I'm here to help. What can I assist you with?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Fallback responses for when no API is configured - using real product data
function generateFallbackResponse(userInput: string): string {
  const input = userInput.toLowerCase();
  
  if (input.includes('size') || input.includes('fit')) {
    return "For sizing help, check our size guide on each product page. For example, our Classic White Button-Down Shirt runs in sizes S-XXL and has a modern tailored fit. Generally, if you're between sizes, we recommend going up one size for comfort.";
  }
  
  if (input.includes('recommend') || input.includes('suggest')) {
    const topProducts = products.filter(p => p.averageRating >= 4.5).slice(0, 3);
    const suggestions = topProducts.map(p => `${p.name} ($${p.price})`).join(', ');
    return `I'd recommend our top-rated items: ${suggestions}. Browse our categories: Women's, Men's, Accessories, or Unisex for more options!`;
  }
  
  if (input.includes('return') || input.includes('exchange')) {
    return "We offer easy returns and exchanges within 30 days. Items should be unworn with tags attached. You can start a return from your order history in your account.";
  }
  
  if (input.includes('shipping') || input.includes('delivery')) {
    return "We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free shipping on orders over $75! Shipping details are shown at checkout.";
  }
  
  if (input.includes('sale') || input.includes('discount')) {
    const saleItems = products.filter(p => p.isSale);
    if (saleItems.length > 0) {
      const deals = saleItems.map(item => `${item.name} ($${item.price})`).join(', ');
      return `Check out our current sales: ${deals}. Great savings on quality clothing!`;
    }
    return "Check out our sales section for amazing deals! We also offer 10% off your first order with newsletter signup.";
  }
  
  if (input.includes('style') || input.includes('outfit')) {
    return `For styling tips, try our versatile pieces like the ${products[1].name} or ${products[0].name}. Mix basics with statement pieces! What occasion are you shopping for?`;
  }
  
  if (input.includes('color') || input.includes('material')) {
    return "All our products include detailed descriptions of materials and available colors. You can filter by color in our product search. What type of item are you looking for?";
  }
  
  if (input.includes('product') || input.includes('what do you have')) {
    return `We have ${products.length} products including dresses, shirts, accessories, and more! Popular items include ${products[0].name}, ${products[2].name}, and ${products[4].name}. Browse our categories to explore everything!`;
  }
  
  return `Thanks for your question! I can help with our ${products.length} products, sizing, styling tips, and shopping assistance. Try asking about our dresses, men's clothing, accessories, or current sales!`;
}