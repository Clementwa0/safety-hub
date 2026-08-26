"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: TabsPrimitive.Root.Props & {
  className?: string;
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.List.Props & {
  className?: string;
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex w-full items-center gap-1 overflow-x-auto",
        "rounded-xl border border-border/60 bg-muted/50 p-1",
        "scrollbar-none",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.Tab.Props & {
  className?: string;
}) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center",
        "rounded-md px-3.5 sm:px-4",
        "whitespace-nowrap",
        "text-sm font-medium text-muted-foreground",
        "outline-none transition-all duration-200",
        "cursor-pointer",

        "hover:bg-background/70 hover:text-foreground",

        "data-active:bg-background",
        "data-active:text-foreground",
        "data-active:shadow-sm",

        "focus-visible:ring-2",
        "focus-visible:ring-ring",
        "focus-visible:ring-offset-1",

        "disabled:pointer-events-none disabled:opacity-50",

        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props & {
  className?: string;
}) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "mt-3 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
};