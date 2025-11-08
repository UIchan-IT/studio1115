"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { generateExampleSentences } from "@/ai/flows/generate-example-sentences";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

export default function ExampleSentences({ word }: { word: string }) {
  const [sentences, setSentences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateExampleSentences({ word });
      setSentences(result.sentences);
    } catch (error) {
      console.error("Failed to generate sentences:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate example sentences for this word.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover onOpenChange={(open) => !open && setSentences([])}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="sr-only">Generate Examples</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">Example Sentences</h4>
            <p className="text-sm text-muted-foreground">
              AI-generated examples for "{word}".
            </p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ul className="space-y-2 list-disc list-inside text-sm">
              {sentences.map((sentence, index) => (
                <li key={index}>{sentence}</li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
