import { getWordLists, getStats } from "@/lib/data";
import StatsCards from "@/components/dashboard/stats-cards";
import WordLists from "@/components/dashboard/word-lists";

export default async function DashboardPage() {
  const stats = await getStats();
  const wordLists = await getWordLists();

  return (
    <div className="container mx-auto">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">
            Here's an overview of your vocabulary progress.
          </p>
        </header>

        <StatsCards stats={stats} />
        
        <WordLists initialWordLists={wordLists} />
      </div>
    </div>
  );
}
