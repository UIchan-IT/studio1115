
import type { Badge } from "./definitions";
import { Award } from "lucide-react";

export const allBadges: Badge[] = [
    {
        id: "perfect-score",
        name: "Perfect Score",
        description: "Get a 100% score on any quiz for the first time.",
        icon: Award,
    },
    // Future badges can be added here
];
