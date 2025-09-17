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
  Maximize2
} from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { cn } from '@/lib/utils';

interface AIAssistantProps {
  className?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ className }) => {
  const { 
    messages, 
    isLoading, 
    isOpen, 
    sendMessage, 
    clearConversation, 
    toggleChat, 
    closeChat 
  } = useAI();
  
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
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
      // Scroll to bottom when messages change
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Focus input when chat opens or is restored
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const messageContent = inputValue.trim();
    setInputValue('');
    await sendMessage(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatMessageContent = (content: string) => {
    // Simple formatting for better readability
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

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-accent hover:bg-accent/80 text-accent-foreground transition-all duration-300 hover:scale-110 hover:shadow-2xl z-50 border-2 border-background",
          className
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    );
  };

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 w-80 sm:w-96 max-w-[calc(100vw-3rem)] h-[32rem] max-h-[calc(100vh-6rem)] flex flex-col shadow-2xl border-2 z-50 transition-all duration-300 bg-background/95 backdrop-blur-sm",
      isMinimized && "h-14",
      className
    )}>
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4 px-4 bg-accent/10 rounded-t-lg border-b flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-accent">
            <AvatarFallback className="bg-accent text-accent-foreground text-sm">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg font-semibold text-foreground">Clothify Assistant</CardTitle>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 hover:bg-accent/20 transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={clearConversation}
            className="h-8 w-8 hover:bg-accent/20 transition-colors"
            title="Clear conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={closeChat}
            className="h-8 w-8 hover:bg-accent/20 transition-colors"
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
                        <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm break-words max-w-[75%] shadow-sm",
                        message.role === 'user'
                          ? "bg-accent text-accent-foreground rounded-br-md"
                          : "bg-muted/70 text-foreground rounded-bl-md"
                      )}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {formatMessageContent(message.content)}
                      </div>
                      <div className={cn(
                        "text-xs mt-2 opacity-60",
                        message.role === 'user' ? "text-accent-foreground" : "text-muted-foreground"
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
                      <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="rounded-2xl rounded-bl-md px-4 py-3 text-sm bg-muted/70 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-muted-foreground ml-2">Typing...</span>
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
                placeholder="Ask me anything about clothing..."
                className="flex-1 text-sm rounded-full border-2 focus:border-accent/50 transition-colors bg-background/80"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!inputValue.trim() || isLoading}
                className="bg-accent hover:bg-accent/80 text-accent-foreground rounded-full w-10 h-10 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Ask about sizing, styling, products, or shopping help!
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default AIAssistant;