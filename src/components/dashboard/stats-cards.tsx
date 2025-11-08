import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book, BrainCircuit, Repeat } from "lucide-react";
import type { Stats } from "@/lib/definitions";

export default function StatsCards({ stats }: { stats: Stats }) {
  const statItems = [
    {
      title: "Total Words",
      value: stats.totalWords,
      icon: Book,
      description: "Across all your lists",
    },
    {
      title: "Words Learned",
      value: stats.wordsLearned,
      icon: BrainCircuit,
      description: "Mastered vocabulary",
    },
    {
      title: "Needs Review",
      value: stats.needsReview,
      icon: Repeat,
      description: "Ready for your next session",
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
