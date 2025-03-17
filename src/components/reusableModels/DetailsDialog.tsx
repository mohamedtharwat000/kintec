import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export interface DetailSection {
  title: string;
  items: {
    label: string;
    value: string | ReactNode;
    colSpan?: 1 | 2;
  }[];
}

interface DetailsDialogProps {
  title: string;
  icon?: ReactNode;
  open: boolean;
  onClose: () => void;
  sections: DetailSection[];
}

export function DetailsDialog({
  title,
  icon = <FileText className="h-5 w-5" />,
  open,
  onClose,
  sections,
}: DetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[85vw] max-h-[90vh] overflow-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>

        {sections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={item.colSpan === 2 ? "md:col-span-2" : ""}
                  >
                    <dt className="font-medium text-muted-foreground mb-1">
                      {item.label}
                    </dt>
                    <dd
                      className={
                        typeof item.value === "string" &&
                        item.value.includes("@")
                          ? "text-blue-600 hover:underline"
                          : "font-medium"
                      }
                    >
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </DialogContent>
    </Dialog>
  );
}
