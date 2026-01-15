"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Properties } from "@/lib/schema";

interface ConfigPreviewProps {
  config: Properties;
  onUpdate?: (config: Properties) => void;
}

export function ConfigPreview({ config, onUpdate }: ConfigPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [editValue, setEditValue] = useState(() =>
    JSON.stringify(config, null, 2),
  );
  const [error, setError] = useState<string | null>(null);

  const _configJson = JSON.stringify(config, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([editValue], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "opencode.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleChange = (value: string) => {
    setEditValue(value);
    try {
      const parsed = JSON.parse(value);
      setError(null);
      onUpdate?.(parsed);
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Preview</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2 bg-transparent"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2 bg-transparent"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <textarea
          value={editValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full h-full min-h-[300px] text-sm font-mono bg-card border border-border rounded-lg p-4 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          spellCheck={false}
        />
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>
    </div>
  );
}
