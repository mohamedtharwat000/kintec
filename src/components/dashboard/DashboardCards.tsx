import React from "react";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowRight, ArrowUp, AlertTriangle } from "lucide-react";

export function SummaryCard({
  title,
  count,
  icon: Icon,
  className,
  trend,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  className?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-lg shadow p-3 sm:p-4 bg-white dark:bg-gray-800 transition-all",
        "hover:shadow-lg border bg-gradient-to-br w-full",
        className
      )}
    >
      <div className="flex justify-between">
        <div className="overflow-hidden">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">
            {title}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {count}
          </h2>
          {trend && (
            <div className="flex items-center mt-2 text-xs font-medium">
              {trend === "up" ? (
                <ArrowUp className="h-3 w-3 text-emerald-500 mr-1 flex-shrink-0" />
              ) : trend === "down" ? (
                <ArrowDown className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
              ) : (
                <ArrowRight className="h-3 w-3 text-amber-500 mr-1 flex-shrink-0" />
              )}
              <span
                className={cn(
                  "truncate",
                  trend === "up"
                    ? "text-emerald-600"
                    : trend === "down"
                      ? "text-red-600"
                      : "text-amber-600"
                )}
              >
                {trend === "up"
                  ? "Increasing"
                  : trend === "down"
                    ? "Decreasing"
                    : "Steady"}
              </span>
            </div>
          )}
        </div>
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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
                  "text-xs font-medium px-2 py-1 rounded-full",
                  trend === "up"
                    ? "text-green-600 bg-green-100"
                    : trend === "down"
                      ? "text-red-600 bg-red-100"
                      : "text-yellow-600 bg-yellow-100"
                )}
              >
                {trend === "up"
                  ? "↑ Up"
                  : trend === "down"
                    ? "↓ Down"
                    : "→ Stable"}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
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
  icon: Icon,
}: {
  title: string;
  items: { label: string; value: number; color: string }[];
  className?: string;
  icon?: React.ElementType;
}) {
  const total = items.reduce((acc, item) => acc + item.value, 0);

  return (
    <div
      className={cn(
        "rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800 transition-all hover:shadow-xl",
        className
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{
                  width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                  transition: "width 0.5s ease-in-out",
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
  icon: Icon = AlertTriangle,
}: {
  title: string;
  count: number;
  description: string;
  severity?: "low" | "medium" | "high";
  className?: string;
  icon?: React.ElementType;
}) {
  const severityColors = {
    low: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-800 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    medium: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-800 dark:text-yellow-300",
      border: "border-yellow-200 dark:border-yellow-800",
      badge:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    high: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-300",
      border: "border-red-200 dark:border-red-800",
      badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
  };

  const colors = severityColors[severity];

  return (
    <div
      className={cn(
        "rounded-lg shadow p-4 sm:p-5 transition-all hover:shadow-md border",
        colors.bg,
        colors.border,
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center">
          <div className={cn("p-2 rounded-full mr-3", colors.bg)}>
            <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", colors.text)} />
          </div>
          <div>
            <h2
              className={cn("font-semibold text-base sm:text-lg", colors.text)}
            >
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "rounded-full px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium self-start sm:self-center",
            colors.badge
          )}
        >
          {count}
        </div>
      </div>
    </div>
  );
}
