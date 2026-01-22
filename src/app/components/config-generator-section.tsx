"use client";

import { produce } from "immer";
import { useCallback, useState } from "react";
import { ConfigForm } from "@/components/config/config-form";
import { ConfigPreview } from "@/components/config/config-preview";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type {
  ConfigSchema,
  Properties,
  PropertyKey,
  PropertyValue,
} from "@/lib/schema";

type NestedRecord = Record<string, unknown>;

export default function ConfigGeneratorSection({
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
      setConfig((prev) =>
        produce(prev, (draft) => {
          if (
            value === undefined ||
            (Array.isArray(value) && value.length === 0)
          ) {
            const keys = [...path] as PropertyKey[];
            let current: NestedRecord = draft as NestedRecord;

            for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];
              if (!(key in current) || current[key] === undefined) {
                return;
              }
              current = current[key] as NestedRecord;
            }

            const lastKey = keys[keys.length - 1];
            delete current[lastKey];
            return;
          }

          const keys = [...path] as PropertyKey[];

          if (
            String(keys[0]) === "keybinds" &&
            keys.length >= 2 &&
            value &&
            typeof value === "string"
          ) {
            const keybinds = draft.keybinds || {};

            if (!draft.keybinds) {
              draft.keybinds = keybinds;
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

            let current: NestedRecord = draft as NestedRecord;
            for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];
              if (!(key in current) || current[key] === undefined) {
                current[key] = {};
              }
              current = current[key] as NestedRecord;
            }

            const finalKey = keys[keys.length - 1];
            current[finalKey] = processedValue;
          } else {
            let current: NestedRecord = draft as NestedRecord;

            for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];
              if (!(key in current) || current[key] === undefined) {
                current[key] = {};
              }
              current = current[key] as NestedRecord;
            }

            const finalKey = keys[keys.length - 1];
            current[finalKey] = value;
          }
        }),
      );
    },
    [],
  );

  return (
    <ResizablePanelGroup
      dir="horizontal"
      className="flex h-full min-h-0 flex-col md:flex-row overflow-hidden"
    >
      <ResizablePanel className="flex-1 min-h-0 bg-[#1A1818] p-4 overflow-auto">
        <ConfigForm
          schema={schema}
          config={config}
          onUpdate={updateConfig}
          themes={themes}
        />
      </ResizablePanel>

      <ResizableHandle withHandle className="hidden md:flex" />

      <ResizablePanel className="flex-1 min-h-0 bg-[#1A1818] p-2 overflow-auto">
        <ConfigPreview config={config} onUpdate={setConfig} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
