import React from "react";
import { cn } from "@/lib/utils";

export function SummaryCard({
  title,
  count,
  icon: Icon,
  className,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800 transition-all hover:shadow-xl",
        className
      )}
    >
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <h2 className="text-2xl font-bold tracking-tight">{count}</h2>
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800 transition-all hover:shadow-xl",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-xl">{title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend === "up"
                    ? "text-green-500"
                    : trend === "down"
                    ? "text-red-500"
                    : "text-yellow-500"
                )}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatusCard({
  title,
  items,
  className,
}: {
  title: string;
  items: { label: string; value: number; color: string }[];
  className?: string;
}) {
  const total = items.reduce((acc, item) => acc + item.value, 0);

  return (
    <div
      className={cn(
        "rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800 transition-all hover:shadow-xl",
        className
      )}
    >
      <h2 className="font-semibold text-lg mb-4">{title}</h2>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{
                  width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertCard({
  title,
  count,
  description,
  severity = "medium",
  className,
}: {
  title: string;
  count: number;
  description: string;
  severity?: "low" | "medium" | "high";
  className?: string;
}) {
  const severityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div
      className={cn(
        "rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800 transition-all hover:shadow-xl border-l-4",
        severity === "low"
          ? "border-blue-500"
          : severity === "medium"
          ? "border-yellow-500"
          : "border-red-500",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium",
            severityColors[severity]
          )}
        >
          {count}
        </div>
      </div>
    </div>
  );
}
