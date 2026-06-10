"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { NewBatchSchema } from "../lib/zod-type/new-batch-type";

interface StepSessionProps {
  form: UseFormReturn<NewBatchSchema>;
  semesterLabels: string[];
  /** Available sessions — already filtered (used sessions excluded) server-side */
  availableSessions: { id: string; name: string; isActive: boolean }[];
}

export function StepSession({
  form,
  semesterLabels,
  availableSessions,
}: StepSessionProps) {
  return (
    <div className="flex flex-col gap-6">
      <Controller
        control={form.control}
        name="sessionId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel required>Academic Session</FieldLabel>
            <FieldContent>
              <NativeSelect
                value={field.value}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
                className="w-full"
                disabled={availableSessions.length === 0}
              >
                <NativeSelectOption value="">
                  {availableSessions.length === 0
                    ? "No available sessions"
                    : "Select session…"}
                </NativeSelectOption>
                {availableSessions.map((s) => (
                  <NativeSelectOption key={s.id} value={s.id}>
                    {s.name}
                    {s.isActive ? " (Active)" : ""}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      {availableSessions.length === 0 && (
        <p className="text-xs text-destructive">
          All academic sessions have been used for this course.
        </p>
      )}

      {/* Semester preview */}
      <div className="rounded-xl border border-dashed bg-muted/30 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <CalendarIcon className="size-3" />
          Semesters that will be created
        </div>
        <div className="flex flex-wrap gap-1.5">
          {semesterLabels.map((label) => (
            <Badge key={label} variant="outline" className="text-[10px]">
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

