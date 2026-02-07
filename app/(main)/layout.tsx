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
                <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
                    <main className="flex-1 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </DataLoader>
    )
}
