"use client";

import { Keyboard, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface KeybindDialogProps {
  value: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  leaderKey: string;
  fieldName: string;
  isLeaderField?: boolean;
}

export function KeybindDialog({
  value,
  defaultValue,
  onChange,
  leaderKey,
  fieldName,
  isLeaderField = false,
}: KeybindDialogProps) {
  const [open, setOpen] = useState(false);
  const [capturedKeys, setCapturedKeys] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const displayValue = useCallback(() => {
    const actualValue = value || defaultValue || "";
    if (!actualValue || isLeaderField) return actualValue;
    if (!leaderKey) return actualValue;
    return actualValue.split(leaderKey).join("<leader>");
  }, [value, defaultValue, leaderKey, isLeaderField])();

  useEffect(() => {
    if (!open) {
      setCapturedKeys([]);
      setIsCapturing(false);
    }
  }, [open]);

  useEffect(() => {
    if (!isCapturing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const parts: string[] = [];

      if (e.ctrlKey || e.key === "Control") parts.push("ctrl");
      if (e.altKey || e.key === "Alt") parts.push("alt");
      if (e.shiftKey || e.key === "Shift") parts.push("shift");
      if (e.metaKey || e.key === "Meta") parts.push("meta");

      if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
        parts.push(e.key.toLowerCase());
      }

      if (parts.length > 0) {
        setCapturedKeys((prev) => [...prev, parts.join("+")]);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isCapturing]);

  const startCapture = () => {
    setCapturedKeys([]);
    setIsCapturing(true);
  };

  const stopCapture = () => {
    setIsCapturing(false);
  };

  const saveKeybind = () => {
    if (capturedKeys.length > 0) {
      let keybind = capturedKeys.join(" ");

      if (!isLeaderField && leaderKey) {
        keybind = keybind.split(leaderKey).join("<leader>");
      }

      onChange(keybind);
    }
    setOpen(false);
  };

  const clearKeybind = () => {
    onChange("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start font-mono text-sm h-10 bg-transparent"
          type="button"
        >
          {displayValue ? (
            <span className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              <span
                className={
                  !value && defaultValue ? "text-muted-foreground" : ""
                }
              >
                {displayValue}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Click to set keybind</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Keybind for {fieldName}</DialogTitle>
          <DialogDescription>
            {isLeaderField
              ? "Press the keys you want to use as your leader key."
              : `Press the keys you want to bind. The leader key will be replaced with <leader>.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-6 min-h-[120px] flex flex-col items-center justify-center">
            {!isCapturing ? (
              <Button onClick={startCapture} size="lg" className="gap-2">
                <Keyboard className="h-5 w-5" />
                Press Keybind
              </Button>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Listening for keys...
                </p>
                {capturedKeys.length > 0 && (
                  <div className="font-mono text-lg bg-background px-4 py-2 rounded border border-border">
                    {capturedKeys.join(" ")}
                  </div>
                )}
                <Button onClick={stopCapture} variant="outline" size="sm">
                  Stop Capture
                </Button>
              </div>
            )}
          </div>

          {capturedKeys.length > 0 && !isCapturing && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Captured Keybind:</p>
              <div className="font-mono text-sm bg-muted px-3 py-2 rounded border border-border">
                {isLeaderField
                  ? capturedKeys.join(" ")
                  : leaderKey
                    ? capturedKeys.join(" ").split(leaderKey).join("<leader>")
                    : capturedKeys.join(" ")}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={clearKeybind}
              className="gap-2 bg-transparent"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
            <Button onClick={saveKeybind} disabled={capturedKeys.length === 0}>
              Save Keybind
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
