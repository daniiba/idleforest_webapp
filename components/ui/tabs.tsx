"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs() {
    const context = React.useContext(TabsContext)
    if (!context) {
        throw new Error("Tabs components must be used within a Tabs provider")
    }
    return context
}

interface TabsProps {
    defaultValue: string
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    className?: string
}

function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue)

    const currentValue = value ?? internalValue
    const handleValueChange = onValueChange ?? setInternalValue

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div className={cn("w-full", className)}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

interface TabsListProps {
    children: React.ReactNode
    className?: string
}

function TabsList({ children, className }: TabsListProps) {
    return (
        <div
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
                className
            )}
        >
            {children}
        </div>
    )
}

interface TabsTriggerProps {
    value: string
    children: React.ReactNode
    className?: string
}

function TabsTrigger({ value, children, className }: TabsTriggerProps) {
    const { value: selectedValue, onValueChange } = useTabs()
    const isSelected = selectedValue === value

    return (
        <button
            type="button"
            onClick={() => onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isSelected
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50 hover:text-foreground",
                className
            )}
        >
            {children}
        </button>
    )
}

interface TabsContentProps {
    value: string
    children: React.ReactNode
    className?: string
}

function TabsContent({ value, children, className }: TabsContentProps) {
    const { value: selectedValue } = useTabs()

    if (selectedValue !== value) {
        return null
    }

    return (
        <div
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
        >
            {children}
        </div>
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
