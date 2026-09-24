import type { ComponentType } from "react";

export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  Body: ComponentType;
};
