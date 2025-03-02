import { SettingsComponent } from "@/components/settings-component";

interface SettingsPageProps {
  params: {
    courseId: string;
  };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  return <SettingsComponent courseId={params.courseId} />;
}
