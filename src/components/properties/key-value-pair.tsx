"use client";

import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import type {
  Properties,
  PropertyKey,
  PropertySchema,
  PropertyValue,
} from "@/lib/schema";
import { PropertyInput } from "./property-input";

interface KeyValuePairProps {
  keyName: string;
  value: PropertyValue;
  schema: PropertySchema;
  path: readonly PropertyKey[];
  onKeyUpdate: (newKey: string) => void;
  onDelete: () => void;
  onUpdate: (path: readonly PropertyKey[], value: PropertyValue) => void;
  rootConfig: Properties;
  themes: { name: string }[];
}

export function KeyValuePair({
  keyName,
  value,
  schema,
  path,
  onKeyUpdate,
  onDelete,
  onUpdate,
  rootConfig,
  themes,
}: KeyValuePairProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingKey, setEditingKey] = useState(false);
  const [keyInputValue, setKeyInputValue] = useState(keyName);
  const [isHovered, setIsHovered] = useState(false);

  const handleKeySubmit = () => {
    if (keyInputValue.trim() && keyInputValue.trim() !== keyName) {
      onKeyUpdate(keyInputValue.trim());
    }
    setEditingKey(false);
  };

  const handleKeyBlur = () => {
    handleKeySubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleKeySubmit();
    } else if (e.key === "Escape") {
      setKeyInputValue(keyName);
      setEditingKey(false);
    }
  };

  return (
    <fieldset
      className="border border-border rounded-lg bg-card overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/20">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 hover:bg-muted/50 rounded px-1 py-0.5 -ml-1 transition-colors"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
        </Collapsible>
        <div className="flex-1 min-w-0">
          {editingKey ? (
            <Input
              value={keyInputValue}
              onChange={(e) => setKeyInputValue(e.target.value)}
              onBlur={handleKeyBlur}
              onKeyDown={handleKeyDown}
              className="h-7 text-sm font-medium"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setKeyInputValue(keyName);
                setEditingKey(true);
              }}
              className="text-sm font-medium truncate hover:text-primary transition-colors text-left"
            >
              {keyName}
            </button>
          )}
        </div>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 opacity-0 transition-opacity ${
            isHovered || isOpen ? "opacity-100" : ""
          }`}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="px-4 py-3 border-t border-border/50 space-y-4">
            {Object.entries(
              (schema as { properties?: Record<string, PropertySchema> })
                .properties || {},
            ).map(([propName, propSchema]) => {
              const propValue = (value as Record<string, unknown>)?.[
                propName
              ] as PropertyValue;
              const propPath = [...path, propName as PropertyKey];

              return (
                <PropertyInput
                  key={propName}
                  name={propName}
                  schema={propSchema}
                  value={propValue}
                  path={propPath}
                  onUpdate={onUpdate}
                  rootConfig={rootConfig}
                  themes={themes}
                />
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </fieldset>
  );
}
