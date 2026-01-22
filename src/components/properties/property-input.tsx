"use client";

import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type {
  Properties,
  PropertyKey,
  PropertySchema,
  PropertyValue,
} from "@/lib/schema";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { DynamicObjectEditor } from "./dynamic-object-editor";

const KeybindDialog = dynamic(
  () =>
    import("@/components/dialogs/keybind-dialog").then((mod) => ({
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
  const [localArrayValue, setLocalArrayValue] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathRef = useRef(path);
  const prevArrayValueRef = useRef<PropertyValue>(undefined);
  const isArrayType = "type" in schema && schema.type === "array";
  const isKeybind = path.length >= 2 && path[0] === "keybinds";
  const isLeaderKey = isKeybind && name === "leader";

  useEffect(() => {
    if (value === undefined || value === null) {
      setLocalValue("");
    } else if (typeof value === "boolean") {
      setLocalValue("");
    } else {
      setLocalValue(String(value));
    }
  }, [value]);

  useEffect(() => {
    if (isArrayType) {
      const parentArrayValue = Array.isArray(value)
        ? (value as string[]).join(", ")
        : "";

      if (value !== prevArrayValueRef.current) {
        if (parentArrayValue !== localArrayValue) {
          setLocalArrayValue(parentArrayValue);
        }
        prevArrayValueRef.current = value;
      }
    }
  }, [value, isArrayType, localArrayValue]);

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

  // Object type with fixed properties
  if (
    "type" in schema &&
    schema.type === "object" &&
    "properties" in schema &&
    schema.properties
  ) {
    const objectValue = (value as Record<string, PropertyValue>) || {};
    const objectSchema = schema.properties as Record<string, PropertySchema>;

    return (
      <div className="space-y-3">
        <TitleAndDescription id={path.join(".")} name={name} schema={schema} />
        <div className="space-y-4 pl-4 border-l-2 border-border">
          {Object.entries(objectSchema).map(([key, propSchema]) => (
            <PropertyInput
              key={key}
              name={key}
              schema={propSchema}
              value={objectValue[key]}
              path={[...path, key as PropertyKey]}
              onUpdate={onUpdate}
              rootConfig={rootConfig}
              themes={themes}
            />
          ))}
        </div>
      </div>
    );
  }

  // Boolean type
  if ("type" in schema && schema.type === "boolean") {
    return (
      <div className="flex items-center justify-between">
        <div>
          <TitleAndDescription
            id={path.join(".")}
            name={name}
            schema={schema}
          />
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
        <TitleAndDescription id={path.join(".")} name={name} schema={schema} />
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
        <TitleAndDescription id={path.join(".")} name={name} schema={schema} />
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
    const min =
      "minimum" in schema
        ? (schema.minimum as number | undefined)
        : "exclusiveMinimum" in schema
          ? (((schema.exclusiveMinimum as number) + 1) as number)
          : undefined;
    const max =
      "maximum" in schema
        ? (schema.maximum as number | undefined)
        : "exclusiveMaximum" in schema
          ? (((schema.exclusiveMaximum as number) - 1) as number)
          : undefined;

    const inputId = path.join(".");

    return (
      <div className="space-y-2">
        <TitleAndDescription id={path.join(".")} name={name} schema={schema} />
        <Input
          id={inputId}
          type="number"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          defaultValue={typeof value === "number" ? value : ""}
          min={min}
          max={max}
          step={schema.type === "integer" ? "1" : "any"}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              handleChange(undefined);
              return;
            }
            const num = Number(val);
            if (min !== undefined && num < min) {
              handleChange(min);
            } else if (max !== undefined && num > max) {
              handleChange(max);
            } else {
              handleChange(num);
            }
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
  if (isArrayType) {
    return (
      <div className="space-y-2">
        <TitleAndDescription id={path.join(".")} name={name} schema={schema} />
        <Textarea
          id={path.join(".")}
          value={localArrayValue}
          onChange={(e) => {
            const val = e.target.value;
            setLocalArrayValue(val);
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
              onUpdate(
                pathRef.current,
                val
                  ? val
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : undefined,
              );
            }, 300);
          }}
          placeholder="Enter values separated by commas"
          rows={2}
        />
      </div>
    );
  }

  if (isKeybind) {
    return (
      <div className="space-y-2">
        <TitleAndDescription id={path.join(".")} name={name} schema={schema} />
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
      <TitleAndDescription id={path.join(".")} name={name} schema={schema} />
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

function TitleAndDescription({
  id,
  name,
  schema,
}: {
  id: string;
  name: string;
  schema: PropertySchema;
}) {
  return (
    <>
      <Label htmlFor={id} className="text-base">
        {name}
      </Label>
      {"description" in schema && schema.description && (
        <p className="text-sm text-muted-foreground">{schema.description}</p>
      )}
    </>
  );
}

export type { PropertyInputProps };
export { PropertyInput };
