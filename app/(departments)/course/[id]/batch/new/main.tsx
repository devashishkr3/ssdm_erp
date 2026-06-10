"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  CoinsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { buildSemesterLabels } from "@/app/(departments)/course/lib/semester";
import { newBatchSchema, DEFAULT_FEE_ROW, type NewBatchSchema } from "./lib/zod-type/new-batch-type";
import { useMutCreateBatch } from "./query/mut-create-batch";
import { StepSession } from "./_components/step-session";
import { StepSubjects } from "./_components/step-subjects";
import { StepFees } from "./_components/step-fees";

// ── Types inferred from fetchCourseById return ────────────────────────────────
type SemesterWithData = {
  semesterNumber: number;
  semesterSubjects: { subjectId: string }[];
  fees: {
    institution: number;
    university: number;
    practical: number;
    cultural: number;
    sports: number;
    miscellaneous: number;
    late: number;
  }[];
};

type LatestBatch = {
  sessionId: string;
  semesters: SemesterWithData[];
};

interface CreateBatchFormProps {
  courseId: string;
  duration: number;
  /** Sessions available for this course (already-used ones excluded server-side) */
  availableSessions: { id: string; name: string; isActive: boolean }[];
  /** Latest batch data for pre-filling (null if first batch) */
  latestBatch: LatestBatch | null;
}

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Session", icon: CalendarIcon },
  { id: 2, label: "Subjects", icon: BookOpenIcon },
  { id: 3, label: "Fees", icon: CoinsIcon },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDefaultSubjects(
  latestBatch: LatestBatch | null,
  semCount: number,
): NewBatchSchema["subjects"] {
  if (!latestBatch) {
    return { sameForAll: true, assignments: { "0": [] } };
  }
  const assignments: Record<string, string[]> = {};
  for (let i = 0; i < semCount; i++) {
    const sem = latestBatch.semesters.find((s) => s.semesterNumber === i + 1);
    assignments[String(i)] = sem
      ? sem.semesterSubjects.map((ss) => ss.subjectId)
      : [];
  }
  return { sameForAll: false, assignments };
}

function buildDefaultFees(
  latestBatch: LatestBatch | null,
  semCount: number,
): NewBatchSchema["fees"] {
  if (!latestBatch) {
    return { sameForAll: true, fees: { "0": { ...DEFAULT_FEE_ROW } } };
  }
  const fees: Record<string, typeof DEFAULT_FEE_ROW> = {};
  for (let i = 0; i < semCount; i++) {
    const sem = latestBatch.semesters.find((s) => s.semesterNumber === i + 1);
    const feeRow = sem?.fees?.[0];
    fees[String(i)] = feeRow
      ? {
          institution: feeRow.institution,
          university: feeRow.university,
          practical: feeRow.practical,
          cultural: feeRow.cultural,
          sports: feeRow.sports,
          miscellaneous: feeRow.miscellaneous,
          late: feeRow.late,
        }
      : { ...DEFAULT_FEE_ROW };
  }
  return { sameForAll: false, fees };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateBatchForm({
  courseId,
  duration,
  availableSessions,
  latestBatch,
}: CreateBatchFormProps) {
  const router = useRouter();
  const createBatch = useMutCreateBatch(courseId);
  const isExistingCourse = latestBatch !== null;

  const semesterLabels = useMemo(
    () => buildSemesterLabels(duration),
    [duration],
  );
  const semCount = semesterLabels.length;

  const [step, setStep] = useState(1);
  const [subjectEditMode, setSubjectEditMode] = useState(!isExistingCourse);
  const [feeEditMode, setFeeEditMode] = useState(!isExistingCourse);

  const form = useForm<NewBatchSchema>({
    resolver: zodResolver(newBatchSchema) as never,
    defaultValues: {
      sessionId: "",
      subjects: buildDefaultSubjects(latestBatch, semCount),
      fees: buildDefaultFees(latestBatch, semCount),
    },
  });

  const handleNext = async () => {
    if (step === 1) {
      const valid = await form.trigger("sessionId");
      if (!valid) return;
    }
    setStep((p) => p + 1);
  };

  const handleBack = () => setStep((p) => Math.max(1, p - 1));

  async function onSubmit(values: NewBatchSchema) {
    try {
      await createBatch.mutateAsync(values);
      router.push(`/course/${courseId}`);
    } catch {
      // error rendered via createBatch.error below
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, idx) => {
          const isDone = step > s.id;
          const isCurrent = step === s.id;
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 transition-colors",
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-background text-primary"
                        : "border-border bg-muted/40 text-muted-foreground",
                  )}
                >
                  {isDone ? (
                    <CheckCircleIcon className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mb-5 h-px flex-1 transition-colors",
                    step > s.id ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Step content */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          {step === 1 && (
            <StepSession
              form={form}
              semesterLabels={semesterLabels}
              availableSessions={availableSessions}
            />
          )}
          {step === 2 && (
            <StepSubjects
              form={form}
              semesterLabels={semesterLabels}
              isExistingCourse={isExistingCourse}
              editMode={subjectEditMode}
              onToggleEdit={() => setSubjectEditMode((p) => !p)}
            />
          )}
          {step === 3 && (
            <StepFees
              form={form}
              semesterLabels={semesterLabels}
              isExistingCourse={isExistingCourse}
              editMode={feeEditMode}
              onToggleEdit={() => setFeeEditMode((p) => !p)}
            />
          )}
        </div>

        {createBatch.error && (
          <div className="mt-4">
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertDescription>{createBatch.error.message}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Step {step} of {STEPS.length}
            </span>
            {step < STEPS.length ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || createBatch.isPending}
              >
                {createBatch.isPending ? "Creating…" : "Create Batch"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
