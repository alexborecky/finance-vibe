import { IncomeInput } from "@/components/income-input";

export default function OnboardingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 md:p-10 transition-colors">
            <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Welcome to FinanceVibe</h1>
                    <p className="text-muted-foreground">Let's set up your income to generate your personal 50/30/20 budget.</p>
                </div>

                <IncomeInput
                    redirectOnSave="/dashboard"
                    className="border-t-primary"
                />

                <div className="text-center text-sm text-muted-foreground">
                    <p>You can always adjust this later in Settings.</p>
                </div>
            </div>
        </div>
    )
}
