"use client";

import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { BookOpenIcon, CopyIcon, LockIcon, PencilIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetSubjects } from "@/app/(departments)/subjects/query/get-subjects";
import type { NewBatchSchema } from "../lib/zod-type/new-batch-type";

interface StepSubjectsProps {
  form: UseFormReturn<NewBatchSchema>;
  semesterLabels: string[];
  /** True when this course already has a batch — subjects are pre-filled */
  isExistingCourse: boolean;
  /** Whether the user has unlocked editing (only relevant when isExistingCourse) */
  editMode: boolean;
  onToggleEdit: () => void;
}

export function StepSubjects({
  form,
  semesterLabels,
  isExistingCourse,
  editMode,
  onToggleEdit,
}: StepSubjectsProps) {
  const { data: subjects = [], isPending } = useGetSubjects();
  const sameForAll: boolean = useWatch({
    control: form.control,
    name: "subjects.sameForAll",
  });

  const copyToAll = () => {
    const first = form.getValues("subjects.assignments.0") ?? [];
    const updated: Record<string, string[]> = {};
    for (let i = 0; i < semesterLabels.length; i++) {
      updated[String(i)] = [...first];
    }
    form.setValue("subjects.assignments", updated);
  };

  // Existing courses always show per-semester rows — each semester has its own subjects
  const rows = (!isExistingCourse && sameForAll)
    ? [{ key: "0", label: "All Semesters" }]
    : semesterLabels.map((label, i) => ({ key: String(i), label }));

  const isReadOnly = isExistingCourse && !editMode;

  return (
    <div className="flex flex-col gap-5">
      {/* Pre-fill notice + edit toggle */}
      {isExistingCourse && (
        <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium">
              {editMode ? "Editing subjects" : "Copied from previous batch"}
            </p>
            <p className="text-xs text-muted-foreground">
              {editMode
                ? "Add or remove subjects per semester"
                : "Subjects are pre-filled from the latest batch"}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onToggleEdit}>
            {editMode ? (
              <>
                <LockIcon className="size-3" />
                Lock
              </>
            ) : (
              <>
                <PencilIcon className="size-3" />
                Modify
              </>
            )}
          </Button>
        </div>
      )}

      {/* Same-for-all toggle — only for first batch (no previous data exists) */}
      {!isExistingCourse && (
        <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Same subjects for all semesters</p>
            <p className="text-xs text-muted-foreground">
              Assign once and apply to every semester
            </p>
          </div>
          <Controller
            control={form.control}
            name="subjects.sameForAll"
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  field.value ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                    field.value ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            )}
          />
        </div>
      )}

      {/* Copy-to-all button — only for first batch with per-semester mode */}
      {!isExistingCourse &&
        !sameForAll &&
        semesterLabels.length > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyToAll}
            className="self-start"
          >
            <CopyIcon className="size-3" />
            Copy Semester I to all
          </Button>
        )}

      {/* Subject rows */}
      <div className="flex flex-col gap-3">
        {rows.map(({ key, label }) => (
          <SubjectRow
            key={key}
            fieldKey={key}
            label={label}
            subjects={subjects}
            isPending={isPending}
            form={form}
            readOnly={isReadOnly}
          />
        ))}
      </div>
    </div>
  );
}

// ── Subject row ───────────────────────────────────────────────────────────────

type Subject = {
  id: string;
  name: string;
  code: string;
  type: string | null;
  hasPractical: boolean;
};

interface SubjectRowProps {
  fieldKey: string;
  label: string;
  subjects: Subject[];
  isPending: boolean;
  form: UseFormReturn<NewBatchSchema>;
  readOnly: boolean;
}

function SubjectRow({
  fieldKey,
  label,
  subjects,
  isPending,
  form,
  readOnly,
}: SubjectRowProps) {
  const selected: string[] = useWatch({
    control: form.control,
    name: `subjects.assignments.${fieldKey}` as never,
  }) ?? [];

  const toggle = (id: string) => {
    if (readOnly) return;
    const current: string[] =
      form.getValues(`subjects.assignments.${fieldKey}` as never) ?? [];
    const next = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    form.setValue(`subjects.assignments.${fieldKey}` as never, next as never);
  };

  return (
    <div className="rounded-xl border bg-background p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <BookOpenIcon className="size-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">{label}</span>
        <Badge variant="secondary" className="text-[10px]">
          {selected.length} selected
        </Badge>
        {readOnly && (
          <Badge variant="outline" className="text-[10px] ml-auto">
            <LockIcon className="size-2.5 mr-1" />
            Read-only
          </Badge>
        )}
      </div>
      {isPending ? (
        <p className="text-xs text-muted-foreground">Loading subjects…</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {subjects.map((s) => {
            const isSelected = selected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                disabled={readOnly}
                onClick={() => toggle(s.id)}
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/30 text-foreground hover:bg-muted/60"
                }`}
              >
                {s.name}
                <span className="opacity-60">{s.code}</span>
                {s.type && (
                  <span className="ml-0.5 rounded bg-background/30 px-1 text-[10px]">
                    {s.type}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
