import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/50 backdrop-blur-sm px-4 sticky top-0 z-10 transition-all">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                </header>
                <main className="flex-1 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}
