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

interface CreateCourseDialogProps {
  children: React.ReactNode;
}

const CreateCourseDialog = ({ children }: CreateCourseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kuerzel, setKuerzel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [teilnehmerzahl, setTeilnehmerzahl] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Replace this with your API call or state update logic.
    console.log("Creating Course:", {
      name,
      kuerzel,
      beschreibung,
      teilnehmerzahl,
    });
    // Reset form and close dialog.
    setName("");
    setKuerzel("");
    setBeschreibung("");
    setTeilnehmerzahl("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Erstelle einen Kurs</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Course name"
              required
            />
          </div>
          <div>
            <Label htmlFor="kuerzel">Kürzel</Label>
            <Input
              id="kuerzel"
              value={kuerzel}
              onChange={(e) => setKuerzel(e.target.value)}
              placeholder="Course abbreviation"
              required
            />
          </div>
          <div>
            <Label htmlFor="beschreibung">Kursbeschreibung</Label>
            <Textarea
              id="beschreibung"
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Course description"
              required
            />
          </div>
          <div>
            <Label htmlFor="teilnehmerzahl">Teilnehmerzahl</Label>
            <Input
              id="teilnehmerzahl"
              type="number"
              value={teilnehmerzahl}
              onChange={(e) => setTeilnehmerzahl(e.target.value)}
              placeholder="Number of students"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
