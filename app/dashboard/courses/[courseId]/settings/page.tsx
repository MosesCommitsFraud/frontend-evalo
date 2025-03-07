import React from "react";
import { SettingsComponent } from "@/components/settings-component";

interface SettingsPageProps {
  params: {
    courseId: string;
  };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  // Access the params directly
  const courseId = params.courseId;
  return <SettingsComponent courseId={courseId} />;
}
