"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, PlusCircle, Trash2 } from "lucide-react";
import type { Word, WordList } from "@/lib/definitions";
import WordTable from "./word-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function WordTableWrapper({ wordList }: { wordList: WordList }) {
  const [words, setWords] = useState<Word[]>(wordList.words);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newWordRef = useRef<HTMLInputElement>(null);
  const newDefinitionRef = useRef<HTMLInputElement>(null);
  const addWordDialogCloseRef = useRef<HTMLButtonElement>(null);
  const importDialogCloseRef = useRef<HTMLButtonElement>(null);
  
  const { toast } = useToast();

  const numSelected = Object.values(selectedRows).filter(Boolean).length;

  const handleAddWord = () => {
    setIsAdding(true);
    const newWordText = newWordRef.current?.value;
    const newDefinitionText = newDefinitionRef.current?.value;

    if (newWordText && newDefinitionText) {
      const newWord: Word = {
        id: `word-${Date.now()}`,
        text: newWordText,
        definition: newDefinitionText,
        exampleSentences: [],
        masteryLevel: 0,
        lastReviewed: null,
        mistakeCount: 0,
      };
      setWords(prev => [newWord, ...prev]);

      if(newWordRef.current) newWordRef.current.value = "";
      if(newDefinitionRef.current) newDefinitionRef.current.value = "";

      toast({
        title: "Word Added",
        description: `"${newWordText}" has been added to the list.`,
      });
      
      addWordDialogCloseRef.current?.click();
    } else {
       toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both a word and a definition.",
      });
    }
    setIsAdding(false);
  };

  const handleImport = () => {
    setIsImporting(true);
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a CSV file to import.",
      });
      setIsImporting(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target?.result as string;
      if (!text) {
        setIsImporting(false);
        return;
      }
      try {
        // Remove BOM if present
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }
        
        const lines = text.split(/\r\n|\n/);
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const wordIndex = headers.indexOf('word');
        const definitionIndex = headers.indexOf('definition');

        if (wordIndex === -1 || definitionIndex === -1) {
          throw new Error("CSV must have 'word' and 'definition' columns.");
        }

        const newWords: Word[] = [];
        for (let i = 1; i < lines.length; i++) {
          if(!lines[i]) continue;
          const data = lines[i].split(',');
          const wordText = data[wordIndex]?.trim();
          const definitionText = data[definitionIndex]?.trim();

          if (wordText && definitionText) {
            newWords.push({
              id: `word-imported-${Date.now()}-${i}`,
              text: wordText.replace(/"/g, ''),
              definition: definitionText.replace(/"/g, ''),
              exampleSentences: [],
              masteryLevel: 0,
              lastReviewed: null,
              mistakeCount: 0,
            });
          }
        }
        
        setWords(prev => [...newWords, ...prev]);
        toast({
          title: "Import Successful",
          description: `${newWords.length} words have been imported.`,
        });
        importDialogCloseRef.current?.click();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: error.message || "Could not parse the CSV file.",
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
       toast({
          variant: "destructive",
          title: "File Error",
          description: "Could not read the selected file.",
        });
       setIsImporting(false);
    }
    reader.readAsText(file);
  };

  const handleDeleteSelected = () => {
    const remainingWords = words.filter((word) => !selectedRows[word.id]);
    setWords(remainingWords);
    toast({
      title: "Words Deleted",
      description: `${numSelected} words have been deleted.`,
    });
    setSelectedRows({});
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Word
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new word</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="word" className="text-right">Word</Label>
                <Input id="word" ref={newWordRef} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="definition" className="text-right">Definition</Label>
                <Input id="definition" ref={newDefinitionRef} className="col-span-3" />
              </div>
            </div>
             <Button onClick={handleAddWord} disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add Word'}
             </Button>
             <DialogClose ref={addWordDialogCloseRef} className="hidden"/>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <FileUp className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import from CSV</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Select a CSV file with 'word' and 'definition' columns.</p>
            <Input type="file" accept=".csv" ref={fileInputRef} />
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
            <DialogClose ref={importDialogCloseRef} className="hidden"/>
          </DialogContent>
        </Dialog>
        
        {numSelected > 0 && (
          <Button variant="destructive" onClick={handleDeleteSelected}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({numSelected})
          </Button>
        )}
      </div>

      <Card className="border shadow-sm rounded-lg">
        <WordTable
          words={words}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      </Card>
    </div>
  );
}
