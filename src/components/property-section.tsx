import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  Properties,
  PropertyKey,
  PropertySchema,
  PropertyValue,
} from "@/lib/schema";
import { PropertyInput } from "./property-input";

interface PropertySectionProps {
  name: string;
  schema: PropertySchema;
  value: PropertyValue;
  path: readonly PropertyKey[];
  onUpdate: (path: readonly PropertyKey[], value: PropertyValue) => void;
  level?: number;
  rootConfig: Properties;
  themes: { name: string }[];
}

export default function PropertySection({
  name,
  schema,
  value,
  path,
  onUpdate,
  level = 0,
  rootConfig,
  themes,
}: PropertySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isSection =
    level === 0 &&
    "properties" in schema &&
    !!(schema as { properties?: object }).properties;

  const nestedEntries = useMemo(() => {
    const props = (schema as { properties?: Record<string, PropertySchema> })
      .properties;
    return props ? Object.entries(props) : [];
  }, [schema]);

  if (isSection) {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
            <div className="text-left">
              <h3 className="font-semibold text-foreground capitalize">
                {name}
              </h3>
            </div>
          </div>
        </button>
        {isExpanded && (
          <div className="p-5 space-y-4">
            {nestedEntries.map(([key, propSchema]) => {
              const val = (value as Properties)?.[
                key as PropertyKey
              ] as PropertyValue;
              return (
                <PropertySection
                  key={key}
                  name={key}
                  schema={propSchema}
                  value={val}
                  path={[...path, key as PropertyKey]}
                  onUpdate={onUpdate}
                  level={level + 1}
                  rootConfig={rootConfig}
                  themes={themes}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <PropertyInput
      name={name}
      schema={schema}
      value={value}
      path={path}
      onUpdate={onUpdate}
      rootConfig={rootConfig}
      themes={themes}
    />
  );
}
