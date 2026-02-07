'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";
import { IncomeInput } from "@/components/income-input";
import { UserPlus, Calculator } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setCheckingSession(false);
      }
    }
    checkUser();
  }, [router]);

  // If loading is true, we still show the login form but maybe with a slight overlay if we want to avoid flash.
  // However, the user wants the login page to be visible.
  // To avoid shift, we can just render everything and if session is found, redirect will happen.
  // But if we want to avoid the "Welcome back" flashing for guests, we can keep a simpler loading or just remove it.

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 p-4 gap-8">
      {checkingSession && !showCalculator && (
        <div className="fixed top-4 right-4 animate-pulse">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}

      <div className="text-center space-y-4 mb-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl text-slate-900 dark:text-slate-100">
          Finance<span className="text-primary">Vibe</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Take control of your financial future with the 50/30/20 rule.
        </p>
      </div>

      {!showCalculator ? (
        <div className="w-full flex flex-col items-center gap-6">
          <LoginForm redirectPath="/dashboard" />

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-12 gap-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm transition-all hover:bg-white dark:hover:bg-slate-900"
              onClick={() => router.push('/ask-invite')}
            >
              <UserPlus className="h-4 w-4 text-primary" />
              Ask for invite
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-12 gap-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm transition-all hover:bg-white dark:hover:bg-slate-900"
              onClick={() => setShowCalculator(true)}
            >
              <Calculator className="h-4 w-4 text-primary" />
              Get your estimate
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <IncomeInput className="mb-4" />
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setShowCalculator(false)}
          >
            Back to login
          </Button>
        </div>
      )}
    </div>
  );
}
