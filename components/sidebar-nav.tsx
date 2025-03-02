"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Mock data - would come from your API
const courses = [
    { id: "course-1", name: "Introduction to Programming", code: "CS101" },
    { id: "course-2", name: "Data Structures & Algorithms", code: "CS201" },
    { id: "course-3", name: "Web Development", code: "CS301" },
    { id: "course-4", name: "Machine Learning Basics", code: "CS401" },
    { id: "course-5", name: "Database Systems", code: "CS202" },
]

export function SidebarNav() {
    const pathname = usePathname()

    return (
        <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Courses</h2>
            <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                    {courses.map((course) => {
                        const href = `/dashboard/courses/${course.id}`
                        const isActive = pathname === href || pathname.startsWith(`${href}/`)

                        return (
                            <Link
                                key={course.id}
                                href={href}
                                className={cn(
                                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent text-accent-foreground" : "transparent",
                                )}
                            >
                                <div className="flex items-center">
                                    <BookOpen className="mr-2 h-4 w-4 text-emerald-600" />
                                    <span>{course.name}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 opacity-70" />
                            </Link>
                        )
                    })}
                </div>
            </ScrollArea>
            <Separator className="my-4" />
        </div>
    )
}