"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface ShareCourseDialogProps {
  courseId: string;
}

const ShareCourseDialog = ({ courseId }: ShareCourseDialogProps) => {
  // Define your share link and 6-digit code.
  const shareLink = `https://evalo.app/feedback/${courseId}`;
  const sessionCode = "123456";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard!",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Copy className="h-4 w-4" />
          Share Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share Course</DialogTitle>
          <DialogDescription>
            Present this information to your class. Scan the QR code or copy the
            link and session code below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Left Column: QR Code */}
          <div className="flex-1 flex items-center justify-center border p-4">
            {/* Replace this placeholder image with an actual QR Code */}
            <img
              src="/placeholder-qr.png"
              alt="QR Code"
              className="w-full max-w-xs"
            />
          </div>
          {/* Right Column: Share Link & Session Code */}
          <div className="flex-1 space-y-6">
            <div>
              <Label
                htmlFor="share-link"
                className="block text-sm font-medium text-muted-foreground"
              >
                Share Link
              </Label>
              <div className="flex mt-1">
                <Input
                  id="share-link"
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={() => handleCopy(shareLink)}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div>
              <Label
                htmlFor="session-code"
                className="block text-sm font-medium text-muted-foreground"
              >
                Session Code
              </Label>
              <div className="flex mt-1">
                <Input
                  id="session-code"
                  value={sessionCode}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={() => handleCopy(sessionCode)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCourseDialog;
