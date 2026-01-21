import "server-only";

const THEMES_URL =
  "https://api.github.com/repos/anomalyco/opencode/contents/packages/opencode/src/cli/cmd/tui/context/theme?ref=dev";

export async function fetchThemes() {
  try {
    const res = await fetch(THEMES_URL, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Failed to fetch themes: ${res.status} ${res.statusText}`);
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const json = await res.json();

    if (!Array.isArray(json)) {
      console.error("Unexpected theme data format:", json);
      throw new Error("Invalid theme data format");
    }

    const themes = json
      .filter((item) => typeof item === "object" && item.name)
      .map((theme) => ({
        name: theme.name.replace(".json", ""),
      }));

    themes.push({ name: "system" });

    return themes;
  } catch (error) {
    console.error("Error fetching themes:", error);
    return [{ name: "system" }, { name: "opencode" }];
  }
}
