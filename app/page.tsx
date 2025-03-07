"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Home,
  BookOpen,
  BarChart,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";

// Animation variants for the navigation items
const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const sharedTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
};

// Navigation items with icons
const navItems = [
  { label: "Home", href: "#", icon: <Home className="h-4 w-4" /> },
  {
    label: "Features",
    href: "#features",
    icon: <BookOpen className="h-4 w-4" />,
  },
  { label: "About", href: "#about", icon: <BarChart className="h-4 w-4" /> },
  {
    label: "Contact",
    href: "#contact",
    icon: <MessageCircle className="h-4 w-4" />,
  },
];

// Animated navigation item component
function AnimatedNavItem({ item }: { item: (typeof navItems)[number] }) {
  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ perspective: "600px" }}
      whileHover="hover"
      initial="initial"
    >
      <motion.a
        href={item.href}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium relative z-10 text-gray-800 dark:text-gray-200 hover:text-gray-900 transition-colors rounded-lg"
        variants={itemVariants}
        transition={sharedTransition}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center bottom",
        }}
      >
        {item.icon}
        <span>{item.label}</span>
      </motion.a>
      <motion.a
        href={item.href}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium absolute inset-0 z-10 text-emerald-600 dark:text-emerald-400 transition-colors rounded-lg"
        variants={backVariants}
        transition={sharedTransition}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center top",
          rotateX: 90,
        }}
      >
        {item.icon}
        <span>{item.label}</span>
      </motion.a>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-950 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="rounded-xl bg-emerald-600 px-2 py-1">
              <span className="text-lg font-bold text-white">evalo</span>
            </div>
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <AnimatedNavItem key={item.label} item={item} />
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="ghost">
              <Link href="/dashboard" className="gap-2">
                Teacher Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-transparent to-transparent dark:from-emerald-950/10 dark:via-transparent dark:to-transparent py-32">
        <div className="container relative">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full border bg-white dark:bg-gray-900 dark:border-gray-800 px-4 py-1.5">
              <span className="text-sm font-medium dark:text-gray-200">
                Trusted by 1000+ educators
              </span>
            </div>
            <h1 className="bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
              Student Feedback Made Simple
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Transform your teaching with real-time student feedback. Get
              valuable insights and improve your courses with ease.
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
              >
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border dark:border-gray-800 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/5 dark:to-transparent p-6 transition-all duration-300 hover:shadow-md">
              <div className="mb-3 inline-flex rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold dark:text-white">
                Anonymous Feedback
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Students can share honest thoughts without worry. All feedback
                is completely anonymous.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border dark:border-gray-800 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/5 dark:to-transparent p-6 transition-all duration-300 hover:shadow-md">
              <div className="mb-3 inline-flex rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold dark:text-white">
                AI-Powered Insights
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Get intelligent analysis of feedback with our advanced AI
                technology.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border dark:border-gray-800 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/5 dark:to-transparent p-6 transition-all duration-300 hover:shadow-md">
              <div className="mb-3 inline-flex rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold dark:text-white">
                Real-Time Analytics
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Track sentiment trends and identify areas for improvement
                instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t dark:border-gray-800 py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-emerald-600 px-2 py-1">
                <span className="text-sm font-bold text-white">evalo</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 Evalo. All rights reserved.
              </span>
            </div>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
