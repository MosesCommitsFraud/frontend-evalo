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
              <div className="h-8 w-8 text-emerald-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 562 653"
                  fill="currentColor"
                >
                  <g transform="translate(0,653) scale(0.1,-0.1)">
                    <path
                      d="M2698 6446 c-58 -16 -202 -97 -1203 -683 -132 -77 -483 -281 -780
                  -454 -339 -197 -558 -330 -588 -358 -59 -55 -103 -144 -117 -236 -7 -47 -10
                  -535 -8 -1490 3 -1592 -3 -1457 77 -1575 47 -71 65 -82 711 -457 289 -167 622
                  -361 740 -430 804 -470 1101 -640 1145 -655 64 -22 179 -23 242 -2 43 15 175
                  89 543 304 201 118 937 546 1455 846 401 232 510 300 555 344 59 58 94 120
                  110 198 7 31 10 554 8 1507 l-3 1460 -28 59 c-40 86 -87 139 -170 189 -39 24
                  -283 167 -542 317 -460 268 -838 488 -1520 886 -187 109 -369 208 -405 221
                  -73 25 -150 28 -222 9z m218 -481 c27 -8 225 -116 439 -241 215 -124 518 -301
                  675 -392 968 -561 982 -570 1042 -633 36 -38 66 -82 80 -117 l23 -57 0 -1255
                  0 -1255 -33 -68 c-53 -107 -98 -143 -397 -316 -148 -87 -605 -352 -1015 -591
                  -410 -238 -765 -441 -790 -451 -104 -40 -223 -33 -324 18 -27 14 -237 134
                  -465 268 -229 133 -492 286 -586 340 -694 401 -995 581 -1033 618 -53 52 -99
                  143 -112 222 -14 83 -13 2374 0 2446 15 77 54 153 109 208 36 35 187 128 587
                  361 296 172 726 422 955 556 495 288 557 322 612 340 57 17 173 17 233 -1z"
                    />
                    <path
                      d="M2735 5390 c-27 -4 -66 -14 -85 -22 -32 -14 -593 -340 -1042 -605
                  -98 -58 -178 -111 -178 -118 0 -13 44 -40 630 -382 212 -124 426 -249 475
                  -278 119 -70 173 -88 265 -88 57 0 90 6 135 25 50 20 796 450 1120 645 90 54
                  123 79 114 87 -29 27 -1175 691 -1229 712 -66 26 -137 34 -205 24z"
                    />
                    <path
                      d="M1008 3843 c-2 -175 0 -332 4 -349 5 -17 18 -40 30 -51 25 -23 232
                  -146 1033 -613 582 -339 572 -334 643 -349 136 -29 181 -13 522 186 1232 719
                  1313 767 1331 797 17 29 19 57 19 364 0 182 -2 332 -4 332 -3 0 -326 -188
                  -806 -470 -556 -326 -815 -474 -854 -488 -22 -8 -71 -17 -107 -19 -126 -10
                  -94 -26 -1089 557 -276 163 -683 400 -712 417 -4 2 -8 -139 -10 -314z"
                    />
                    <path
                      d="M1008 2518 c-2 -391 -3 -387 20 -418 11 -14 68 -54 128 -89 60 -35
                  233 -137 384 -226 591 -348 1093 -637 1133 -652 61 -22 190 -20 253 4 51 20
                  278 150 1039 596 226 132 452 264 503 294 60 35 97 64 107 83 23 44 22 735 0
                  726 -8 -3 -210 -120 -448 -259 -237 -140 -486 -285 -552 -322 -66 -38 -229
                  -133 -362 -211 -134 -79 -264 -151 -290 -160 -67 -24 -193 -22 -258 3 -27 11
                  -169 89 -315 175 -146 85 -416 243 -600 350 -184 108 -424 248 -533 312 -108
                  64 -200 116 -202 116 -3 0 -6 -145 -7 -322z"
                    />
                  </g>
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
              href="/auth/sign-in"
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
