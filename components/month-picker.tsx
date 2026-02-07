"use client"

import * as React from "react"
import { format, setMonth, setYear } from "date-fns"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MonthPickerProps {
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    className?: string;
    failingMonths?: Date[];
}

export function MonthPicker({ currentMonth, onMonthChange, className, failingMonths = [] }: MonthPickerProps) {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    const handleMonthSelect = (monthIndex: number) => {
        onMonthChange(setMonth(currentMonth, monthIndex));
    }

    const handleYearSelect = (year: number) => {
        onMonthChange(setYear(currentMonth, year));
    }

    const nextMonth = () => onMonthChange(setMonth(currentMonth, currentMonth.getMonth() + 1));
    const prevMonth = () => onMonthChange(setMonth(currentMonth, currentMonth.getMonth() - 1));

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex items-center rounded-md border bg-background shadow-none h-[32px]">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-full w-8 rounded-none rounded-l-md border-r hover:bg-muted"
                    onClick={prevMonth}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-full px-3 font-semibold text-sm rounded-none hover:bg-muted min-w-[100px] relative">
                            {format(currentMonth, "MMMM")}
                            {failingMonths.some(d => d.getFullYear() === currentMonth.getFullYear()) && (
                                <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="max-h-[300px] overflow-y-auto">
                        {months.map((monthIndex) => (
                            <DropdownMenuItem
                                key={monthIndex}
                                onClick={() => handleMonthSelect(monthIndex)}
                                className={cn(
                                    "cursor-pointer justify-center",
                                    monthIndex === currentMonth.getMonth() && "bg-accent text-accent-foreground font-medium",
                                    "flex items-center justify-between"
                                )}
                            >
                                <span>{format(new Date(2000, monthIndex, 1), "MMMM")}</span>
                                {failingMonths.some(d => d.getMonth() === monthIndex && d.getFullYear() === currentMonth.getFullYear()) && (
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-full w-8 rounded-none rounded-r-md border-l hover:bg-muted"
                    onClick={nextMonth}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-[32px] px-3 font-semibold text-sm bg-background shadow-none">
                        {format(currentMonth, "yyyy")}
                        <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {years.map((year) => (
                        <DropdownMenuItem
                            key={year}
                            onClick={() => handleYearSelect(year)}
                            className={cn(
                                "cursor-pointer",
                                year === currentMonth.getFullYear() && "bg-accent text-accent-foreground font-medium"
                            )}
                        >
                            {year}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
