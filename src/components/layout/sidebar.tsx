import { getWordLists } from "@/lib/data";
import SidebarNav from "./sidebar-nav";

// This is a server component wrapper to fetch data
export default async function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const wordLists = await getWordLists();

  return (
    <SidebarNav wordLists={wordLists} isMobile={isMobile}/>
  );
}
