"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, PlusCircle, Trash2 } from "lucide-react";
import type { Word, WordList } from "@/lib/definitions";
import WordTable from "./word-table";
import ExampleSentences from "./example-sentences";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WordTableWrapper({ wordList }: { wordList: WordList }) {
  const [words, setWords] = useState<Word[]>(wordList.words);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const numSelected = Object.values(selectedRows).filter(Boolean).length;

  // Placeholder functions for actions
  const handleAddWord = () => console.log("Add word");
  const handleImport = () => console.log("Import words");
  const handleDeleteSelected = () => {
    const remainingWords = words.filter((word) => !selectedRows[word.id]);
    setWords(remainingWords);
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
                <Input id="word" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="definition" className="text-right">Definition</Label>
                <Input id="definition" className="col-span-3" />
              </div>
            </div>
             <Button onClick={handleAddWord}>Add Word</Button>
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
            <Input type="file" accept=".csv" />
            <Button onClick={handleImport}>Import</Button>
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
