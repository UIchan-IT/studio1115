"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, PlusCircle, Trash2, Loader2 } from "lucide-react";
import type { Word, WordList } from "@/lib/definitions";
import WordTable from "./word-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { addWord, addWords, deleteWords } from "@/lib/firestore";
import { useFirestore } from "@/firebase";

export default function WordTableWrapper({ wordList }: { wordList: WordList & { words: Word[] } }) {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [addWordOpen, setAddWordOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newWordRef = useRef<HTMLInputElement>(null);
  const newDefinitionRef = useRef<HTMLInputElement>(null);

  const firestore = useFirestore();
  const { toast } = useToast();

  const numSelected = Object.values(selectedRows).filter(Boolean).length;

  const handleAddWord = async () => {
    setIsAdding(true);
    const newWordText = newWordRef.current?.value;
    const newDefinitionText = newDefinitionRef.current?.value;

    if (newWordText && newDefinitionText) {
      try {
        await addWord(firestore, wordList.id, {
          text: newWordText,
          definition: newDefinitionText,
        });

        if(newWordRef.current) newWordRef.current.value = "";
        if(newDefinitionRef.current) newDefinitionRef.current.value = "";

        toast({
          title: "Word Added",
          description: `"${newWordText}" has been added to the list.`,
        });
        
        setAddWordOpen(false);
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error",
          description: "Could not add the word.",
        });
      }
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
    reader.onload = async (e) => {
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

        const wordsToImport: { text: string; definition: string }[] = [];
        for (let i = 1; i < lines.length; i++) {
          if(!lines[i]) continue;
          // Basic CSV parsing, may need to be more robust for complex CSVs
          const data = lines[i].split(',');
          const wordText = data[wordIndex]?.trim().replace(/"/g, '');
          const definitionText = data[definitionIndex]?.trim().replace(/"/g, '');

          if (wordText && definitionText) {
            wordsToImport.push({
              text: wordText,
              definition: definitionText,
            });
          }
        }
        
        await addWords(firestore, wordList.id, wordsToImport);

        toast({
          title: "Import Successful",
          description: `${wordsToImport.length} words have been imported.`,
        });
        setImportOpen(false);
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

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    const wordIdsToDelete = Object.keys(selectedRows).filter(id => selectedRows[id]);
    try {
        await deleteWords(firestore, wordList.id, wordIdsToDelete);
        toast({
            title: "Words Deleted",
            description: `${numSelected} words have been deleted.`,
        });
        setSelectedRows({});
    } catch(error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the selected words.",
        });
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Dialog open={addWordOpen} onOpenChange={setAddWordOpen}>
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
            <DialogFooter>
             <Button onClick={handleAddWord} disabled={isAdding}>
                {isAdding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Adding...</> : 'Add Word'}
             </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={importOpen} onOpenChange={setImportOpen}>
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
            <DialogFooter>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Importing...</> : 'Import'}
            </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {numSelected > 0 && (
          <Button variant="destructive" onClick={handleDeleteSelected} disabled={isDeleting}>
             {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete ({numSelected})
          </Button>
        )}
      </div>

      <Card className="border shadow-sm rounded-lg">
        <WordTable
          words={wordList.words}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      </Card>
    </div>
  );
}
