import { GithubBadge } from "@/components/github-badge";
import { ModeToggle } from "@/components/theme-toggle";
import { fetchThemes } from "@/lib/data/github";
import { getConfigSchema } from "@/lib/schema";
import ConfigGeneratorSection from "./components/config-generator-section";
import HeroSection from "./components/hero-section";

export default async function Page() {
  const schema = getConfigSchema();
  const themes = await fetchThemes();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-semibold">oc forge</span>
          </div>
          <div className="flex gap-2 items-center">
            <GithubBadge />
            <ModeToggle />
          </div>
        </div>
      </header>
      <HeroSection />
      <ConfigGeneratorSection schema={schema} themes={themes} />
    </div>
  );
}
