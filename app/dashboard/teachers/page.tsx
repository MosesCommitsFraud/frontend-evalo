"use client";

import React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Mock teacher data with profile picture, email and courses meta info.
const teachers = [
  {
    id: "teacher-1",
    name: "Alice Johnson",
    email: "alice.johnson@example.edu",
    avatar: "/avatars/alice.jpg", // Use a valid URL or local asset
    courses: [
      {
        id: "course-1",
        name: "Introduction to Programming",
        nextEvent: "Lecture on React, 10:00 AM",
        overallSatisfaction: "85%",
        participants: "50",
      },
      {
        id: "course-3",
        name: "Web Development",
        nextEvent: "Workshop, 2:00 PM",
        overallSatisfaction: "90%",
        participants: "40",
      },
    ],
  },
  {
    id: "teacher-2",
    name: "Bob Smith",
    email: "bob.smith@example.edu",
    avatar: "/avatars/bob.jpg",
    courses: [
      {
        id: "course-2",
        name: "Data Structures & Algorithms",
        nextEvent: "Assignment Due, 3:00 PM",
        overallSatisfaction: "80%",
        participants: "35",
      },
    ],
  },
  {
    id: "teacher-3",
    name: "Charlie Brown",
    email: "charlie.brown@example.edu",
    avatar: "/avatars/charlie.jpg",
    courses: [
      {
        id: "course-4",
        name: "Machine Learning Basics",
        nextEvent: "Guest Lecture, 1:00 PM",
        overallSatisfaction: "75%",
        participants: "30",
      },
      {
        id: "course-5",
        name: "Database Systems",
        nextEvent: "Project Demo, 4:00 PM",
        overallSatisfaction: "88%",
        participants: "45",
      },
    ],
  },
];

export default function TeachersPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Teachers</h1>
      <Accordion type="single" collapsible className="space-y-2">
        {teachers.map((teacher) => (
          <AccordionItem key={teacher.id} value={teacher.id}>
            <AccordionTrigger className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={teacher.avatar} alt={teacher.name} />
                <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{teacher.name}</p>
                <p className="text-xs text-muted-foreground">{teacher.email}</p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-4 space-y-4">
                <h2 className="text-lg font-semibold mb-2">Courses Owned</h2>
                <div className="grid gap-4">
                  {teacher.courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/dashboard/courses/${course.id}`}
                    >
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle>{course.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between gap-4">
                            <div className="flex flex-col">
                              <p className="text-sm font-medium">Next Event</p>
                              <p className="text-xs text-muted-foreground">
                                {course.nextEvent}
                              </p>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-sm font-medium">
                                Overall Satisfaction
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {course.overallSatisfaction}
                              </p>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-sm font-medium">
                                Participants
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {course.participants}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
