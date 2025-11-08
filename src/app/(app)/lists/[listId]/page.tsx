import { getWordListById } from "@/lib/data";
import WordListHeader from "@/components/word-lists/word-list-header";
import WordTableWrapper from "@/components/word-lists/word-table-wrapper";
import { notFound } from "next/navigation";

export default async function WordListPage({
  params,
}: {
  params: { listId: string };
}) {
  const wordList = await getWordListById(params.listId);

  if (!wordList) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <WordListHeader wordList={wordList} />
      <WordTableWrapper wordList={wordList} />
    </div>
  );
}
