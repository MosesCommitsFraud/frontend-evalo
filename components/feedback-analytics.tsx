"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sentimentData = [
  { name: "Week 1", positive: 40, negative: 24, neutral: 36 },
  { name: "Week 2", positive: 45, negative: 20, neutral: 35 },
  { name: "Week 3", positive: 50, negative: 15, neutral: 35 },
  { name: "Week 4", positive: 55, negative: 10, neutral: 35 },
];

const categoryData = [
  { name: "Suggestions", value: 35 },
  { name: "Praise", value: 45 },
  { name: "Questions", value: 15 },
  { name: "Criticism", value: 25 },
];

const topKeywords = [
  { keyword: "homework", count: 25 },
  { keyword: "lectures", count: 20 },
  { keyword: "assignments", count: 18 },
  { keyword: "exams", count: 15 },
  { keyword: "projects", count: 12 },
];

export function FeedbackAnalytics({ courseId }: { courseId: string }) {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <Select defaultValue="30">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Trend</CardTitle>
            <CardDescription>Sentiment distribution over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sentimentData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="positive"
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="negative"
                    stroke="#dc2626"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="neutral"
                    stroke="#737373"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Categories</CardTitle>
            <CardDescription>Distribution of feedback types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Keywords</CardTitle>
          <CardDescription>Most frequently mentioned terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {topKeywords.map((item) => (
              <Card key={item.keyword}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{item.count}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.keyword}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
