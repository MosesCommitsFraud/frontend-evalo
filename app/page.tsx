import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-600 px-2 py-1">
              <span className="text-lg font-bold text-primary-foreground">
                evalo
              </span>
            </div>
          </div>
          <Button asChild variant="ghost">
            <Link href="/dashboard" className="gap-2">
              Teacher Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-transparent to-transparent py-32">
        <div className="container relative">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full border bg-white px-4 py-1.5">
              <span className="text-sm font-medium">
                Trusted by 1000+ educators
              </span>
            </div>
            <h1 className="bg-gradient-to-br from-emerald-600 to-emerald-800 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
              Student Feedback Made Simple
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Transform your teaching with real-time student feedback. Get
              valuable insights and improve your courses with ease.
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-emerald-50 to-transparent p-6">
              <div className="mb-3 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Anonymous Feedback</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Students can share honest thoughts without worry. All feedback
                is completely anonymous.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-emerald-50 to-transparent p-6">
              <div className="mb-3 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">AI-Powered Insights</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get intelligent analysis of feedback with our advanced AI
                technology.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-emerald-50 to-transparent p-6">
              <div className="mb-3 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Real-Time Analytics</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track sentiment trends and identify areas for improvement
                instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-emerald-600 px-2 py-1">
                <span className="text-sm font-bold text-primary-foreground">
                  evalo
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                © 2025 Evalo. All rights reserved.
              </span>
            </div>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
