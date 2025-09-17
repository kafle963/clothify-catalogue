import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Send, 
  X, 
  RotateCcw, 
  Bot, 
  User,
  Minimize2,
  Maximize2,
  HelpCircle
} from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { cn } from '@/lib/utils';

interface VendorAIAssistantProps {
  className?: string;
}

interface VendorAIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const VendorAIAssistant: React.FC<VendorAIAssistantProps> = ({ className }) => {
  const [messages, setMessages] = useState<VendorAIMessage[]>([
    {
      id: '1',
      content: `Hello! I'm your dedicated vendor assistant. I can help you with:

• Product management and optimization
• Sales analytics and insights
• Store settings and configuration
• Marketing strategies and tips
• Order fulfillment best practices
• Account and billing questions

What would you like help with today?`,
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  const generateVendorResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('product') && (input.includes('add') || input.includes('create') || input.includes('upload'))) {
      return `To add a new product to your store:

1. **Go to Add Product**: Navigate to "Add Product" in your dashboard
2. **Product Details**: Fill in the product name, description, and category
3. **Images**: Upload high-quality product images (recommended: 1200x1200px)
4. **Pricing**: Set your price and any discounts
5. **Inventory**: Add stock quantities and size variations
6. **SEO**: Add keywords and meta descriptions for better visibility

**Pro Tips:**
• Use clear, descriptive titles
• Include size guides and care instructions
• Upload multiple product angles
• Write compelling descriptions that highlight benefits

Would you like me to guide you through any specific step?`;
    }

    if (input.includes('analytics') || input.includes('sales') || input.includes('performance')) {
      return `Your analytics dashboard provides key insights:

**📊 Key Metrics to Track:**
• Revenue trends and growth patterns
• Best-selling products and categories
• Customer demographics and behavior
• Conversion rates and traffic sources
• Inventory turnover rates

**📈 How to Improve Performance:**
• Focus on products with high conversion rates
• Optimize low-performing product listings
• Use seasonal trends to plan inventory
• Monitor customer feedback for improvements

**💡 Quick Actions:**
• Check your weekly revenue growth
• Identify your top 5 bestsellers
• Review products with low stock
• Analyze peak sales times

Want me to explain any specific metric or help you interpret your data?`;
    }

    if (input.includes('order') && (input.includes('fulfill') || input.includes('ship') || input.includes('process'))) {
      return `Order fulfillment best practices:

**📦 Order Processing Workflow:**
1. **Review Orders**: Check new orders within 24 hours
2. **Verify Inventory**: Confirm product availability
3. **Package Safely**: Use appropriate packaging materials
4. **Update Status**: Mark as "Processing" then "Shipped"
5. **Provide Tracking**: Share tracking information with customers

**⚡ Quick Tips:**
• Process orders within 1-2 business days
• Use professional packaging with your branding
• Include care instructions and thank you notes
• Send proactive updates to customers

**📞 Common Issues:**
• Out of stock items → Contact customer immediately
• Damaged products → Offer replacement or refund
• Shipping delays → Communicate transparently

Need help setting up shipping rates or processing a specific order?`;
    }

    if (input.includes('marketing') || input.includes('promote') || input.includes('advertis')) {
      return `Marketing strategies for your store:

**🎯 Product Promotion:**
• Create compelling product descriptions
• Use high-quality lifestyle photos
• Offer limited-time discounts
• Bundle related products together

**📱 Social Media Marketing:**
• Share behind-the-scenes content
• Post customer photos and reviews
• Use relevant hashtags for discovery
• Engage with your community regularly

**💌 Customer Retention:**
• Send follow-up emails after purchases
• Offer exclusive discounts to repeat customers
• Create a loyalty program
• Ask for reviews and testimonials

**📊 Track Your Results:**
• Monitor click-through rates
• Track conversion from different channels
• Measure customer lifetime value
• A/B test different approaches

Which marketing area would you like to focus on first?`;
    }

    if (input.includes('setting') || input.includes('config') || input.includes('account') || input.includes('profile')) {
      return `Account and store configuration help:

**🏪 Store Settings:**
• Business Information: Keep your profile updated
• Payment Methods: Ensure all payment options work
• Shipping Settings: Configure accurate shipping rates
• Tax Settings: Set up proper tax calculations

**🔒 Security Settings:**
• Enable two-factor authentication
• Use strong passwords
• Regularly review login activity
• Keep contact information current

**📧 Notification Preferences:**
• Order notifications: Stay informed of new orders
• Inventory alerts: Get notified when stock is low
• Customer messages: Respond quickly to inquiries
• Marketing updates: Stay informed about new features

**💰 Payment & Billing:**
• Review your payout schedule
• Update banking information
• Monitor transaction fees
• Check monthly statements

Need help with any specific settings or have questions about your account?`;
    }

    if (input.includes('help') || input.includes('support') || input.includes('problem') || input.includes('issue')) {
      return `I'm here to help! Here are common topics I can assist with:

**🛒 Store Management:**
• Adding and editing products
• Managing inventory and stock
• Setting up collections and categories
• Optimizing product listings

**📊 Business Growth:**
• Understanding your analytics
• Marketing and promotion strategies
• Customer service best practices
• Seasonal planning and trends

**⚙️ Technical Support:**
• Account settings and configuration
• Payment and shipping setup
• Order management and fulfillment
• Troubleshooting common issues

**💼 Business Advice:**
• Pricing strategies
• Product photography tips
• Customer retention strategies
• Scaling your business

Just describe your specific question or challenge, and I'll provide detailed guidance!`;
    }

    // Default response for general queries
    return `I'd be happy to help! As your vendor assistant, I can provide guidance on:

• **Product Management**: Adding products, inventory, pricing
• **Sales & Analytics**: Understanding your performance data
• **Order Fulfillment**: Processing and shipping orders
• **Marketing**: Promoting your products effectively
• **Account Settings**: Configuring your store and profile
• **Business Strategy**: Growing your online presence

Could you tell me more about what specific area you'd like help with? The more details you provide, the better I can assist you!`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const messageContent = inputValue.trim();
    setInputValue('');

    // Add user message
    const userMessage: VendorAIMessage = {
      id: Date.now().toString(),
      content: messageContent,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateVendorResponse(messageContent);
      
      const assistantMessage: VendorAIMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, Math.random() * 1500 + 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatMessageContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => (
        <span key={index}>
          {line}
          {index < content.split('\n').length - 1 && <br />}
        </span>
      ));
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        content: `Hello! I'm your dedicated vendor assistant. I can help you with:

• Product management and optimization
• Sales analytics and insights
• Store settings and configuration
• Marketing strategies and tips
• Order fulfillment best practices
• Account and billing questions

What would you like help with today?`,
        role: 'assistant',
        timestamp: new Date(),
      }
    ]);
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl z-50 border-2 border-background",
          className
        )}
        size="icon"
      >
        <HelpCircle className="h-6 w-6" />
        <span className="sr-only">Open Vendor Assistant</span>
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 w-80 sm:w-96 max-w-[calc(100vw-3rem)] h-[32rem] max-h-[calc(100vh-6rem)] flex flex-col shadow-2xl border-2 z-50 transition-all duration-300 bg-background/95 backdrop-blur-sm",
      isMinimized && "h-14",
      className
    )}>
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4 px-4 bg-blue-50 rounded-t-lg border-b flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-blue-600">
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              <HelpCircle className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg font-semibold text-foreground">Vendor Assistant</CardTitle>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 hover:bg-blue-100 transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={clearConversation}
            className="h-8 w-8 hover:bg-blue-100 transition-colors"
            title="Clear conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={closeChat}
            className="h-8 w-8 hover:bg-blue-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          {/* Messages Container */}
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 px-4 py-2 ai-chat-scroll">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 w-full",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          <HelpCircle className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm break-words max-w-[75%] shadow-sm",
                        message.role === 'user'
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-muted/70 text-foreground rounded-bl-md"
                      )}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {formatMessageContent(message.content)}
                      </div>
                      <div className={cn(
                        "text-xs mt-2 opacity-60",
                        message.role === 'user' ? "text-white" : "text-muted-foreground"
                      )}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 w-full justify-start">
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        <HelpCircle className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="rounded-2xl rounded-bl-md px-4 py-3 text-sm bg-muted/70 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-muted-foreground ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          <Separator className="bg-border/50" />

          {/* Input Area */}
          <div className="p-4 bg-background/50 rounded-b-lg flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about products, analytics, orders, marketing..."
                className="flex-1 text-sm rounded-full border-2 focus:border-blue-500/50 transition-colors bg-background/80"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Get help with store management, analytics, and business growth!
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default VendorAIAssistant;