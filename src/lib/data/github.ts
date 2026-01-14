import "server-only";

const THEMES_URL =
  "https://api.github.com/repos/anomalyco/opencode/contents/packages/opencode/src/cli/cmd/tui/context/theme?ref=dev";

export async function fetchThemes() {
  const res = await fetch(THEMES_URL, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error("Failed to fetch themes:", res);
    return [];
  }

  const json = (await res.json()) as { name: string }[];
  const themes = json.map((theme) => ({
    name: theme.name.replace(".json", ""),
  }));

  themes.push({ name: "system" });

  return themes;
}
