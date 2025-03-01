"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface DetailDialogProps<T extends Record<string, any>> {
  data: T;
  title: string;
  excludeFields?: string[];
}

export function DetailDialog<T extends Record<string, any>>({
  data,
  title,
  excludeFields = ["contracts"],
}: DetailDialogProps<T>) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.entries(data)
            .filter(([key]) => !excludeFields.includes(key))
            .map(([key, value]) => (
              <div key={key} className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium capitalize">
                  {key.replace(/_/g, " ")}
                </div>
                <div className="col-span-3 text-sm">
                  {value === null || value === undefined
                    ? "N/A"
                    : typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </div>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
