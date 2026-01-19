"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

const KeybindDialog = dynamic(
  () =>
    import("@/components/keybind-dialog").then((mod) => ({
      default: mod.KeybindDialog,
    })),
  {
    ssr: false,
  },
);

import { DynamicObjectEditor } from "@/components/dynamic-object-editor";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  ConfigSchema,
  Properties,
  PropertyKey,
  PropertySchema,
  PropertyValue,
} from "@/lib/schema";

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

function PropertySection({
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

interface PropertyInputProps {
  name: string;
  schema: PropertySchema;
  value: PropertyValue;
  path: readonly PropertyKey[];
  onUpdate: (path: readonly PropertyKey[], value: PropertyValue) => void;
  rootConfig: Properties;
  themes: { name: string }[];
}

const PropertyInput = memo(function PropertyInput({
  name,
  schema,
  value,
  path,
  onUpdate,
  rootConfig,
  themes,
}: PropertyInputProps) {
  const [localValue, setLocalValue] = useState(
    value === undefined || value === null ? "" : String(value),
  );
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathRef = useRef(path);
  pathRef.current = path;

  useEffect(() => {
    if (value === undefined || value === null) {
      setLocalValue("");
    } else if (typeof value === "boolean") {
      setLocalValue("");
    } else {
      setLocalValue(String(value));
    }
  }, [value]);

  const debouncedUpdate = useCallback(
    (newValue: PropertyValue) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onUpdate(pathRef.current, newValue);
      }, 300);
    },
    [onUpdate],
  );

  const handleChange = useCallback(
    (newValue: PropertyValue) => {
      onUpdate(pathRef.current, newValue);
    },
    [onUpdate],
  );

  const isKeybind = path.length >= 2 && path[0] === "keybinds";
  const isLeaderKey = isKeybind && name === "leader";

  if (
    "type" in schema &&
    schema.type === "object" &&
    "additionalProperties" in schema &&
    schema.additionalProperties !== false &&
    schema.additionalProperties !== undefined
  ) {
    return (
      <DynamicObjectEditor
        name={name}
        schema={schema}
        value={value as Record<string, PropertyValue>}
        path={path}
        onUpdate={onUpdate}
        rootConfig={rootConfig}
        themes={themes}
      />
    );
  }

  // Boolean type
  if ("type" in schema && schema.type === "boolean") {
    return (
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor={path.join(".")} className="text-sm capitalize">
            {name}
          </Label>
          {"description" in schema && schema.description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {schema.description}
            </p>
          )}
        </div>
        <Switch
          id={path.join(".")}
          aria-label={name}
          checked={(value as boolean) || false}
          onCheckedChange={(checked: boolean) =>
            handleChange(checked as PropertyValue)
          }
        />
      </div>
    );
  }

  // Theme type (special case for theme name)
  if (name === "theme" && themes.length > 0) {
    return (
      <div className="space-y-2">
        <Label htmlFor={path.join(".")} className="text-sm capitalize">
          {name}
        </Label>
        {"description" in schema && schema.description && (
          <p className="text-sm text-muted-foreground">{schema.description}</p>
        )}
        <Select value={(value as string) || ""} onValueChange={handleChange}>
          <SelectTrigger id={path.join(".")}>
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            {themes.map((theme) => (
              <SelectItem key={theme.name} value={theme.name}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Enum type
  if ("enum" in schema && schema.enum) {
    return (
      <div className="space-y-2">
        <Label htmlFor={path.join(".")} className="text-sm capitalize">
          {name}
        </Label>
        {"description" in schema && schema.description && (
          <p className="text-sm text-muted-foreground">{schema.description}</p>
        )}
        <Select value={(value as string) || ""} onValueChange={handleChange}>
          <SelectTrigger id={path.join(".")}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {schema.enum.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Number type
  if (
    "type" in schema &&
    (schema.type === "number" || schema.type === "integer")
  ) {
    return (
      <div className="space-y-2">
        <Label htmlFor={path.join(".")} className="text-sm capitalize">
          {name}
        </Label>
        {"description" in schema && schema.description && (
          <p className="text-sm text-muted-foreground">{schema.description}</p>
        )}
        <Input
          id={path.join(".")}
          type="number"
          value={typeof value === "number" ? value : ""}
          onChange={(e) => {
            const val = e.target.value;
            handleChange(val === "" ? undefined : Number(val));
          }}
          placeholder={
            "default" in schema && schema.default
              ? schema.default.toString()
              : ""
          }
        />
      </div>
    );
  }

  // Array type
  if ("type" in schema && schema.type === "array") {
    return (
      <div className="space-y-2">
        <Label htmlFor={path.join(".")} className="text-sm capitalize">
          {name}
        </Label>
        {"description" in schema && schema.description && (
          <p className="text-sm text-muted-foreground">{schema.description}</p>
        )}
        <Textarea
          id={path.join(".")}
          value={Array.isArray(value) ? (value as string[]).join(", ") : ""}
          onChange={(e) => {
            const val = e.target.value;
            handleChange(
              val
                ? val
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : undefined,
            );
          }}
          placeholder="Enter values separated by commas"
          rows={3}
        />
      </div>
    );
  }

  if (isKeybind) {
    return (
      <div className="space-y-2">
        <Label htmlFor={path.join(".")} className="text-sm capitalize">
          {name}
        </Label>
        {"description" in schema && schema.description && (
          <p className="text-sm text-muted-foreground">{schema.description}</p>
        )}
        <KeybindDialog
          value={(value as string) || ""}
          defaultValue={
            "default" in schema && schema.default
              ? (schema.default as string)
              : ""
          }
          onChange={handleChange}
          leaderKey={
            ((rootConfig.keybinds as Record<string, unknown>)
              ?.leader as string) || ""
          }
          fieldName={name}
          isLeaderField={isLeaderKey}
        />
      </div>
    );
  }

  // String type (default) with debouncing

  return (
    <div className="space-y-2">
      <Label htmlFor={path.join(".")} className="text-sm capitalize">
        {name}
      </Label>
      {"description" in schema && schema.description && (
        <p className="text-sm text-muted-foreground">{schema.description}</p>
      )}
      <Input
        id={path.join(".")}
        type="text"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          debouncedUpdate(e.target.value);
        }}
        placeholder={
          "default" in schema && schema.default
            ? String(schema.default)
            : undefined
        }
      />
    </div>
  );
});

export type { PropertyInputProps };
export { PropertyInput };
