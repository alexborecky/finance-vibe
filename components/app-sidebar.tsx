"use client"

import * as React from "react"
import { LayoutDashboard, Wallet, PiggyBank, Settings, LogOut, Menu, Coins, CreditCard, Landmark, Briefcase, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useFinanceStore } from "@/lib/store"
import { calculateFinanceOverview, checkProjectedSolvency } from "@/lib/finance-engine"
import { useAuth } from "@/lib/auth/auth-context"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"

// Menu items
const navItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Income",
        url: "/income",
        icon: Coins,
    },
    {
        title: "Expenses",
        url: "/expenses",
        icon: CreditCard,
    },
    {
        title: "Savings",
        url: "/savings",
        icon: Landmark,
    },
    {
        title: "Goals",
        url: "/goals",
        icon: PiggyBank,
    },
    {
        title: "Assets",
        url: "/assets",
        icon: Briefcase,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const router = useRouter()
    const { incomeConfig, transactions, goals } = useFinanceStore()
    const [mounted, setMounted] = React.useState(false)
    const { user, profile, signOut } = useAuth()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Calculate alert status for Expenses
    // Check next 12 months for negative balance
    // Calculate alert status for Expenses
    // Check next 12 months for negative balance
    const { hasAlert, failingMonths } = checkProjectedSolvency(incomeConfig, transactions, goals, 12)

    // Check if user is admin/superadmin
    const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'

    // Get user initials
    const getUserInitials = () => {
        if (profile?.email) {
            const parts = profile.email.split('@')[0].split('.')
            if (parts.length >= 2) {
                return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            }
            return profile.email.substring(0, 2).toUpperCase()
        }
        return 'U'
    }

    const handleLogout = async () => {
        await signOut()
        router.push('/auth/login')
    }

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-slate-200 dark:border-slate-800">
            <SidebarHeader>
                <div className="flex items-center justify-between px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                    <div className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:hidden">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                            <span className="font-bold text-lg tracking-tight">FinanceVibe</span>
                            <span className="text-xs text-muted-foreground">Pro Edition</span>
                        </div>
                    </div>
                    <SidebarTrigger className="h-8 w-8" />
                </div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                <SidebarMenu className="px-2 py-2">
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={pathname === item.url}
                                className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Link href={item.url} className="relative w-full flex items-center gap-2">
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                    {mounted && item.title === "Expenses" && hasAlert && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>Negative balance in {failingMonths.map(d => format(d, 'MMMM')).join(', ')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    {mounted && isAdmin && (
                        <>
                            <SidebarSeparator className="my-2" />
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip="Admin"
                                    isActive={pathname === '/admin'}
                                    className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <Link href="/admin" className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        <span>Admin</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    )}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src="" alt={profile?.email || 'User'} />
                                        <AvatarFallback className="rounded-lg">{getUserInitials()}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {profile?.email?.split('@')[0] || 'User'}
                                        </span>
                                        <span className="truncate text-xs">{profile?.email || 'No email'}</span>
                                    </div>
                                    <Menu className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
