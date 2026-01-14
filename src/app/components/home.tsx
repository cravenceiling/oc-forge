"use client";

import { useCallback, useState } from "react";
import { ConfigForm } from "@/components/config-form";
import { ConfigPreview } from "@/components/config-preview";
import type {
  ConfigSchema,
  Properties,
  PropertyKey,
  PropertyValue,
} from "@/lib/schema";

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T;
  }
  const cloned: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      cloned[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  return cloned as T;
}

export default function ConfigGeneratorPage({
  schema,
  themes,
}: {
  schema: ConfigSchema;
  themes: { name: string }[];
}) {
  const schemaUrl = "https://opencode.ai/config.json";
  const [config, setConfig] = useState<Properties>({
    $schema: schemaUrl,
  } as Properties);

  const updateConfig = useCallback(
    (path: readonly PropertyKey[], value: PropertyValue) => {
      setConfig((prev) => {
        const newConfig = deepClone(prev) as Properties;

        if (
          value === undefined ||
          (Array.isArray(value) && value.length === 0)
        ) {
          const keys = [...path] as PropertyKey[];
          let current: Record<string, unknown> = newConfig;

          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || current[key] === undefined) {
              return prev;
            }
            current = current[key] as Record<string, unknown>;
          }

          const lastKey = keys[keys.length - 1];
          delete current[lastKey];

          return newConfig;
        }

        const keys = [...path] as PropertyKey[];
        let current: Record<string, unknown> = newConfig;

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!(key in current) || current[key] === undefined) {
            current[key] = {};
          }
          current = current[key] as Record<string, unknown>;
        }

        const finalKey = keys[keys.length - 1];
        current[finalKey] = value;

        return newConfig;
      });
    },
    [],
  );

  return (
    <div id="config-section" className="w-full h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="bg-[#1A1818] border border-border rounded-lg p-6 overflow-y-auto">
          <ConfigForm
            schema={schema}
            config={config}
            onUpdate={updateConfig}
            themes={themes}
          />
        </div>
        <div className="bg-[#1A1818] border border-border rounded-lg p-6 overflow-y-auto">
          <ConfigPreview config={config} />
        </div>
      </div>
    </div>
  );
}
