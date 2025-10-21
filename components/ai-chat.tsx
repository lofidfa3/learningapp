'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot, User, MessageSquare } from 'lucide-react';
import { VocabularyTable } from '@/components/vocabulary-table';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  articleContent: string;
  articleTitle: string;
}

export function AIChat({ articleContent, articleTitle }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const requestBody = {
        articleContent,
        articleTitle,
        userQuestion: userMessage.content
      };

      console.log('Sending request to DeepSeek AI');

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.error && !data.answer) {
        const errorMessage = data.details || data.error;
        
        const errorChatMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `❌ ${errorMessage}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorChatMessage]);
        return;
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `❌ Network error: ${error.message}. Please check your internet connection and try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What is the main topic of this article?",
    "Can you explain the key points?",
    "What are the important vocabulary words?",
    "How does this relate to current events?",
    "What can I learn from this article?"
  ];

  return (
    <Card className="retro-card border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bot className="h-5 w-5 retro-glow" />
          AI Article Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask questions about this article to enhance your learning experience
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* DeepSeek AI Badge */}
        <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-primary">
              🤖 Powered by DeepSeek AI
            </span>
            <span className="text-xs text-muted-foreground">
              • Always available • No API key needed
            </span>
          </div>
        </div>

        {/* Suggested Questions */}
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(question)}
                  className="text-xs retro-button border-muted"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'ai' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[90%] p-4 rounded-lg shadow-sm ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-background border border-border text-foreground'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content.includes('|') && message.content.includes('Word') ? (
                    <VocabularyTable content={message.content} />
                  ) : (
                    message.content.split('\n').map((line, index) => {
                      // Handle markdown tables
                      if (line.includes('|') && line.trim().length > 0) {
                        return (
                          <div key={index} className="my-2">
                            <div className="bg-background/50 p-2 rounded border">
                              <div className="font-mono text-xs whitespace-pre overflow-x-auto">
                                {line}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    
                    // Handle bold text
                    if (line.includes('**') && line.includes('**')) {
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <div key={index} className="my-2">
                          {parts.map((part, partIndex) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return (
                                <strong key={partIndex} className="font-semibold text-foreground">
                                  {part.slice(2, -2)}
                                </strong>
                              );
                            }
                            return part;
                          })}
                        </div>
                      );
                    }
                    
                    // Handle bullet points
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                      return (
                        <div key={index} className="my-2 ml-4 flex items-start">
                          <span className="text-primary mr-2 font-bold">•</span>
                          <span className="flex-1">{line.trim().substring(1).trim()}</span>
                        </div>
                      );
                    }
                    
                    // Handle numbered lists
                    if (/^\d+\./.test(line.trim())) {
                      return (
                        <div key={index} className="my-2 ml-4 flex items-start">
                          <span className="text-primary mr-2 font-semibold">
                            {line.trim().split('.')[0]}.
                          </span>
                          <span className="flex-1">{line.trim().substring(line.trim().indexOf('.') + 1).trim()}</span>
                        </div>
                      );
                    }
                    
                    // Handle headers
                    if (line.trim().startsWith('#')) {
                      const level = line.match(/^#+/)?.[0].length || 1;
                      const text = line.replace(/^#+\s*/, '');
                      const className = level === 1 ? 'text-lg font-bold' : 
                                      level === 2 ? 'text-base font-semibold' : 
                                      'text-sm font-medium';
                      return (
                        <div key={index} className={`my-2 ${className} text-primary`}>
                          {text}
                        </div>
                      );
                    }
                    
                    // Regular text
                    return (
                      <div key={index} className="my-2 leading-relaxed">
                        {line || '\u00A0'}
                      </div>
                    );
                  })
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              {message.type === 'user' && (
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-accent" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-background border border-border text-foreground p-4 rounded-lg shadow-sm max-w-[90%]">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">AI is thinking...</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Generating response...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this article..."
            className="retro-input flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="retro-button border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          🤖 Powered by DeepSeek AI • Always available • Smart responses for language learning
        </p>
      </CardContent>
    </Card>
  );
}
