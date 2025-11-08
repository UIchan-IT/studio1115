import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Word } from "@/lib/definitions";
import ExampleSentences from "./example-sentences";

interface WordTableProps {
  words: Word[];
  selectedRows: Record<string, boolean>;
  setSelectedRows: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export default function WordTable({
  words,
  selectedRows,
  setSelectedRows,
}: WordTableProps) {
  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows: Record<string, boolean> = {};
    if (checked) {
      words.forEach((word) => {
        newSelectedRows[word.id] = true;
      });
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectRow = (wordId: string, checked: boolean) => {
    setSelectedRows((prev) => ({
      ...prev,
      [wordId]: checked,
    }));
  };

  const allSelected =
    words.length > 0 && Object.keys(selectedRows).length === words.length && Object.values(selectedRows).every(Boolean);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all rows"
            />
          </TableHead>
          <TableHead className="w-[200px]">Word</TableHead>
          <TableHead>Definition</TableHead>
          <TableHead className="w-[150px] text-center">Mistakes</TableHead>
          <TableHead className="w-[150px] text-center">Test Count</TableHead>
          <TableHead className="w-[150px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {words.length > 0 ? (
          words.map((word) => (
            <TableRow
              key={word.id}
              data-state={selectedRows[word.id] ? "selected" : undefined}
            >
              <TableCell>
                <Checkbox
                  checked={selectedRows[word.id] || false}
                  onCheckedChange={(checked) =>
                    handleSelectRow(word.id, !!checked)
                  }
                  aria-label={`Select row for ${word.text}`}
                />
              </TableCell>
              <TableCell className="font-medium">{word.text}</TableCell>
              <TableCell>{word.definition}</TableCell>
              <TableCell className="text-center">
                {word.progress?.mistakeCount ?? 0}
              </TableCell>
              <TableCell className="text-center">
                {word.progress?.testCount ?? 0}
              </TableCell>
              <TableCell className="text-right">
                <ExampleSentences word={word.text} />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No words in this list yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
