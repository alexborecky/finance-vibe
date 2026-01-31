import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IncomeInput } from "@/components/income-input";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl text-slate-900 dark:text-slate-100">
          Finance<span className="text-primary">Vibe</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Master your money with the 50/30/20 rule. The simplest way to track needs, wants, and savings.
        </p>
        <Link href="/onboarding">
          <Button size="lg" className="rounded-full px-8 text-lg font-semibold shadow-lg hover:scale-105 transition-transform">
            Get Started
          </Button>
        </Link>
      </div>

      {/* Demo Calculator */}
      <div className="w-full max-w-md opacity-80 hover:opacity-100 transition-opacity">
        <p className="text-center text-xs text-muted-foreground mb-2">Try the demo logic below</p>
        <IncomeInput />
      </div>
    </div>
  );
}
