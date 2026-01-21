import { fetchThemes } from "@/lib/data/github";
import { getConfigSchema } from "@/lib/schema";
import ConfigGeneratorSection from "../components/config-generator-section";

export default async function Page() {
  const schema = getConfigSchema();
  const themes = await fetchThemes();

  return (
    <div className="h-screen flex flex-col">
      <ConfigGeneratorSection schema={schema} themes={themes} />
    </div>
  );
}
