"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Home,
  BookOpen,
  BarChart,
  MessageCircle,
  Brain,
  LineChart,
  Zap,
  ThumbsUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

// Custom Button component for BackgroundPaths

// FloatingPaths component for BackgroundPaths
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-slate-950 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

// BackgroundPaths component
function BackgroundPaths({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

// Custom LinkButton component
function LinkButton({
  href,
  children,
  variant = "default",
  size = "default",
  className,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <Link
      href={href}
      {...props}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        // Variants
        variant === "default" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "destructive" &&
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        variant === "outline" &&
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        variant === "secondary" &&
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        variant === "link" && "text-primary underline-offset-4 hover:underline",
        // Sizes
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 rounded-md px-3",
        size === "lg" && "h-11 rounded-md px-8",
        size === "icon" && "h-10 w-10",
        className,
      )}
    >
      {children}
    </Link>
  );
}

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
  {
    label: "How It Works",
    href: "#how-it-works",
    icon: <Zap className="h-4 w-4" />,
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
            {/* React Logo with inline SVG */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 text-emerald-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <circle cx="50" cy="50" r="8" />
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="45"
                    ry="17"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="45"
                    ry="17"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    transform="rotate(60 50 50)"
                  />
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="45"
                    ry="17"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    transform="rotate(-60 50 50)"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-emerald-600">
                evalo
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <AnimatedNavItem key={item.label} item={item} />
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LinkButton
              href="/dashboard"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
            >
              Teacher Login
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Paths */}
      <div className="relative">
        <BackgroundPaths>
          <div className="mb-8 inline-flex items-center rounded-full border bg-white dark:bg-gray-900 dark:border-gray-800 px-4 py-1.5">
            <span className="text-sm font-medium dark:text-gray-200">
              Trusted by 1000+ educators
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600">
            Real-time Student Insights
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your teaching with AI-powered feedback analysis. Get
            valuable insights into student sentiment and improve your courses
            with actionable data.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6">
            <LinkButton
              href="/dashboard"
              size="lg"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton
              href="#how-it-works"
              variant="outline"
              size="lg"
              className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Learn More
            </LinkButton>
          </div>
        </BackgroundPaths>
      </div>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to collect, analyze and act on student
              feedback
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border dark:border-gray-800 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/5 dark:to-transparent p-6 transition-all duration-300 hover:shadow-md">
              <div className="mb-3 inline-flex rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-semibold dark:text-white">
                AI-Powered Analysis
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Our advanced AI algorithms automatically analyze student
                feedback to identify trends, sentiment, and key insights.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border dark:border-gray-800 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/5 dark:to-transparent p-6 transition-all duration-300 hover:shadow-md">
              <div className="mb-3 inline-flex rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold dark:text-white">
                Anonymous Feedback
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Students can share honest thoughts without worry. All feedback
                is completely anonymous, encouraging open communication.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border dark:border-gray-800 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/5 dark:to-transparent p-6 transition-all duration-300 hover:shadow-md">
              <div className="mb-3 inline-flex rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
                <LineChart className="h-5 w-5" />
              </div>
              <h3 className="font-semibold dark:text-white">
                Real-Time Analytics
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Track sentiment trends and identify areas for improvement
                instantly with intuitive dashboards and visualizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to transform your teaching with data-driven
              insights
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xl">
                1
              </div>
              <h3 className="font-semibold text-xl mt-4 mb-3 dark:text-white">
                Create a Session
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate a unique session code or QR code for your lecture or
                class that students can access.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xl">
                2
              </div>
              <h3 className="font-semibold text-xl mt-4 mb-3 dark:text-white">
                Students Provide Feedback
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Students anonymously share their thoughts, questions, and
                feedback about the lecture or course content.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xl">
                3
              </div>
              <h3 className="font-semibold text-xl mt-4 mb-3 dark:text-white">
                Analyze & Improve
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Review AI-generated insights, sentiment analysis, and actionable
                recommendations to enhance your teaching.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Educators Say</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover how Evalo is transforming teaching experiences
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold dark:text-white">
                    Dr. Sarah Johnson
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Computer Science Professor
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                &#34;Evalo has completely transformed how I understand student
                comprehension. The sentiment analysis helped me identify
                challenging topics that I could then address in follow-up
                lectures.&#34;
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold dark:text-white">
                    Prof. Michael Chen
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Biology Department
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                &#34;The anonymous feedback feature has been invaluable.
                Students are much more honest, which gives me genuine insights
                into how to improve my teaching methods.&#34;
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold dark:text-white">
                    Prof. Emily Rodriguez
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Engineering Faculty
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                &#34;The real-time analytics allow me to adjust my teaching pace
                and style even during lectures. My student satisfaction scores
                have improved dramatically since using Evalo.&#34;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-50 dark:bg-emerald-950/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Teaching?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of educators who are using AI-powered feedback to
              improve their teaching and student outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton
                href="/dashboard"
                size="lg"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
              >
                Sign Up for Free
                <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton
                href="#contact"
                variant="outline"
                size="lg"
                className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Contact Sales
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t dark:border-gray-800 py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              {/* Logo in footer */}
              <div className="h-6 w-6 text-emerald-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <circle cx="50" cy="50" r="8" />
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="45"
                    ry="17"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="45"
                    ry="17"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    transform="rotate(60 50 50)"
                  />
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="45"
                    ry="17"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    transform="rotate(-60 50 50)"
                  />
                </svg>
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
