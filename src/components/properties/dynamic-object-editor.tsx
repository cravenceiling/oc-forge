"use client";

import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { KeyValuePair } from "@/components/properties/key-value-pair";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  Properties,
  PropertyKey,
  PropertySchema,
  PropertyValue,
} from "@/lib/schema";

interface DynamicObjectEditorProps {
  name: string;
  schema: PropertySchema & {
    additionalProperties?: PropertySchema | boolean | object;
  };
  value: Record<string, PropertyValue> | undefined;
  path: readonly PropertyKey[];
  onUpdate: (path: readonly PropertyKey[], value: PropertyValue) => void;
  rootConfig: Properties;
  themes: { name: string }[];
}

function getInitialValue(schema: PropertySchema): PropertyValue {
  if ("type" in schema) {
    switch (schema.type) {
      case "boolean":
        return false;
      case "number":
      case "integer":
        return 0;
      case "array":
        return [];
      case "object":
        return {} as PropertyValue;
    }
  }
  return "";
}

export function DynamicObjectEditor({
  name,
  schema,
  value,
  path,
  onUpdate,
  rootConfig,
  themes,
}: DynamicObjectEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const entries = Object.entries(value || {});

  const valueSchema =
    typeof schema.additionalProperties === "object"
      ? (schema.additionalProperties as PropertySchema)
      : { type: "string" };
  const propertyName = name;

  const handleAdd = () => {
    if (!newKey.trim()) {
      setKeyError("Key is required");
      return;
    }

    if (entries.some(([k]) => k === newKey.trim())) {
      setKeyError(`A ${propertyName} with this key already exists`);
      return;
    }

    const initialValue = getInitialValue(valueSchema);
    const newValueObj = { ...value, [newKey.trim()]: initialValue } as Record<
      string,
      PropertyValue
    >;
    onUpdate(path, newValueObj as PropertyValue);
    setNewKey("");
    setKeyError("");
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewKey("");
    setKeyError("");
    setIsAdding(false);
  };

  const handleUpdate = (
    updatePath: readonly PropertyKey[],
    newValue: PropertyValue,
  ) => {
    onUpdate(updatePath, newValue);
  };

  const handleKeyUpdate = (oldKey: string, newKey: string) => {
    const currentValue = value?.[oldKey];
    if (!currentValue) return;

    const newValueObj = { ...value };
    delete newValueObj[oldKey];
    newValueObj[newKey] = currentValue;
    onUpdate(path, newValueObj as PropertyValue);
  };

  const handleDelete = (key: string) => {
    const newValueObj = { ...value };
    delete newValueObj[key];
    onUpdate(path, newValueObj as PropertyValue);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm capitalize">{name}</Label>
      <div className="space-y-3">
        {entries.map(([key, entryValue]) => (
          <KeyValuePair
            key={key}
            keyName={key}
            value={entryValue}
            schema={valueSchema}
            path={[...path, key as PropertyKey]}
            onKeyUpdate={(newKey) => handleKeyUpdate(key, newKey)}
            onDelete={() => handleDelete(key)}
            onUpdate={handleUpdate}
            rootConfig={rootConfig}
            themes={themes}
          />
        ))}
        {isAdding && (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/20 border-b border-border/50">
              <span className="text-sm font-medium capitalize">
                New {propertyName}
              </span>
              <div className="flex-1" />
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <Label htmlFor="new-key">Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-key"
                    value={newKey}
                    onChange={(e) => {
                      setNewKey(e.target.value);
                      setKeyError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAdd();
                      } else if (e.key === "Escape") {
                        handleCancel();
                      }
                    }}
                    placeholder={`Enter ${propertyName} key`}
                    autoFocus
                  />
                  <Button size="icon" onClick={handleAdd}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
                {keyError && (
                  <p className="text-sm text-destructive">{keyError}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {!isAdding && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {propertyName}
        </Button>
      )}
    </div>
  );
}
