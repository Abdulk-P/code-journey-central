
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const motivationalQuotes = [
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    quote: "The best way to predict the future is to invent it.",
    author: "Alan Kay"
  },
  {
    quote: "If you want to achieve greatness, stop asking for permission.",
    author: "Anonymous"
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    quote: "The only limit to our realization of tomorrow is our doubts of today.",
    author: "Franklin D. Roosevelt"
  },
  {
    quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    quote: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House"
  },
  {
    quote: "First, solve the problem. Then, write the code.",
    author: "John Johnson"
  },
  {
    quote: "Programming isn't about what you know; it's about what you can figure out.",
    author: "Chris Pine"
  },
  {
    quote: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs"
  },
  {
    quote: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde"
  }
];

const MotivationalQuote: React.FC = () => {
  const [quote, setQuote] = useState<{ quote: string; author: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Get a random quote
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    const randomQuote = motivationalQuotes[randomIndex];
    
    // Simulate a short loading delay
    const timer = setTimeout(() => {
      setQuote(randomQuote);
      setLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!quote) return null;

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <blockquote className="text-center">
          <p className="text-lg font-medium">&ldquo;{quote.quote}&rdquo;</p>
          <footer className="mt-2 text-sm text-muted-foreground">
            &mdash; {quote.author}
          </footer>
        </blockquote>
      </CardContent>
    </Card>
  );
};

export default MotivationalQuote;
