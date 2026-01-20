"use client";

import { useMemo } from "react";

import type {
  ConfigSchema,
  Properties,
  PropertyKey,
  PropertySchema,
  PropertyValue,
} from "@/lib/schema";
import PropertySection from "./property-section";

interface ConfigFormProps {
  schema: ConfigSchema;
  config: Properties;
  onUpdate: (path: readonly PropertyKey[], value: PropertyValue) => void;
  themes: { name: string }[];
}

export function ConfigForm({
  schema,
  config,
  onUpdate,
  themes,
}: ConfigFormProps) {
  const properties = schema.properties;

  const propertyEntries = useMemo(
    () => Object.entries(properties),
    [properties],
  );

  return (
    <div className="space-y-6">
      {propertyEntries.map(([key, property]) => {
        const k = key as PropertyKey;
        const value = config[k] as PropertyValue;
        const propertySchema: PropertySchema = property;

        return (
          <PropertySection
            key={key}
            name={key}
            schema={propertySchema}
            value={value}
            path={[k]}
            onUpdate={onUpdate}
            rootConfig={config}
            themes={themes}
          />
        );
      })}
    </div>
  );
}
