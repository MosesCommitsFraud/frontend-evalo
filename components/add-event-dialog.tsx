"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddEventDialogProps {
  children: React.ReactNode;
}

const AddEventDialog = ({ children }: AddEventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("lecture");
  const [date, setDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeUntil, setTimeUntil] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Creating Event:", {
      eventName,
      description,
      eventType,
      date,
      timeFrom,
      timeUntil,
    });
    // Reset form and close dialog.
    setEventName("");
    setDescription("");
    setEventType("lecture");
    setDate("");
    setTimeFrom("");
    setTimeUntil("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Name */}
          <div>
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Enter event name"
              required
            />
          </div>
          {/* Short Event Description */}
          <div>
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a short description"
              required
            />
          </div>
          {/* Event Type Radio Group */}
          <div>
            <Label>Event Type</Label>
            <RadioGroup
              value={eventType}
              onValueChange={setEventType}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="lecture" id="radio-lecture" />
                <Label htmlFor="radio-lecture">Lecture</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="webinar" id="radio-webinar" />
                <Label htmlFor="radio-webinar">Webinar</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="exercise" id="radio-exercise" />
                <Label htmlFor="radio-exercise">Exercise</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem
                  value="self-learning"
                  id="radio-self-learning"
                />
                <Label htmlFor="radio-self-learning">Self-learning</Label>
              </div>
            </RadioGroup>
          </div>
          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          {/* Timeslot */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="time-from">From</Label>
              <Input
                id="time-from"
                type="time"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="time-until">Until</Label>
              <Input
                id="time-until"
                type="time"
                value={timeUntil}
                onChange={(e) => setTimeUntil(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
