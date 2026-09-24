import type { Lesson } from "./types";
import { foundations } from "./foundations";
import { riskAndProcess } from "./risk-and-process";

/** Self-paced lesson material by product slug. Cohort and membership content is delivered live. */
export const COURSE_LESSONS: Record<string, Lesson[]> = {
  foundations,
  "risk-and-process": riskAndProcess,
};

export function lessonsFor(slug: string): Lesson[] {
  return COURSE_LESSONS[slug] ?? [];
}
