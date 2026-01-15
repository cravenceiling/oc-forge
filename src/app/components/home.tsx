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

        if (
          String(keys[0]) === "keybinds" &&
          keys.length >= 2 &&
          value &&
          typeof value === "string"
        ) {
          const keybinds =
            ((newConfig as unknown as Record<string, unknown>)
              .keybinds as Record<string, unknown>) || {};
          if (!(newConfig as unknown as Record<string, unknown>).keybinds) {
            (newConfig as unknown as Record<string, unknown>).keybinds =
              keybinds;
          }
          const hasLeaderKey =
            keybinds.leader !== undefined && keybinds.leader !== "";
          const isLeaderUpdate = String(keys[1]) === "leader";
          let processedValue = value;

          if (!hasLeaderKey && !isLeaderUpdate) {
            keybinds.leader = "ctrl+x";
            processedValue = processedValue.split("ctrl+x").join("<leader>");
          } else if (hasLeaderKey && !isLeaderUpdate) {
            processedValue = processedValue
              .split(String(keybinds.leader))
              .join("<leader>");
          }

          let current: Record<string, unknown> = newConfig;
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || current[key] === undefined) {
              current[key] = {};
            }
            current = current[key] as Record<string, unknown>;
          }

          const finalKey = keys[keys.length - 1];
          current[finalKey] = processedValue;
        } else {
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
        }

        return newConfig;
      });
    },
    [],
  );

  return (
    <div id="config-section" className="w-full min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 p-4 lg:p-6 h-auto lg:h-screen">
        <div className="bg-[#1A1818] border border-border rounded-lg p-4 lg:p-6 overflow-y-auto max-h-[50vh] lg:max-h-none">
          <ConfigForm
            schema={schema}
            config={config}
            onUpdate={updateConfig}
            themes={themes}
          />
        </div>
        <div className="bg-[#1A1818] border border-border rounded-lg p-4 lg:p-6 overflow-hidden flex flex-col max-h-[50vh] lg:max-h-none">
          <ConfigPreview config={config} onUpdate={setConfig} />
        </div>
      </div>
    </div>
  );
}
