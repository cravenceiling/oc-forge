"use client";

import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type {
  Properties,
  PropertyKey,
  PropertySchema,
  PropertyValue,
} from "@/lib/schema";
import { DynamicObjectEditor } from "./dynamic-object-editor";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

const KeybindDialog = dynamic(
  () =>
    import("@/components/keybind-dialog").then((mod) => ({
      default: mod.KeybindDialog,
    })),
  {
    ssr: false,
  },
);

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
