import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DataLoader } from "@/components/data-loader"

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DataLoader>
            <SidebarProvider>
                <AppSidebar />
                <div className="flex flex-col w-full h-svh bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
                    <main className="flex-1 flex flex-col p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500 min-h-0">
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </DataLoader>
    )
}
