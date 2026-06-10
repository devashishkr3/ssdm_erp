"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { getDepartment } from "@/app/(departments)/department/query/get-all-department";
import {
  COURSE_DURATIONS,
  type NewCourseSchema,
} from "../lib/zod-type/new-course-type";

export function CourseDetailRow({
  form,
}: {
  form: UseFormReturn<NewCourseSchema>;
}) {
  const {
    data: departments = [],
    isPending: deptPending,
    isError: deptError,
    error: deptErrorMessage,
  } = useQuery(getDepartment());

  return (
    <>
      <Controller
        control={form.control}
        name="departmentId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid || deptError}>
            <FieldLabel required>Department</FieldLabel>
            <FieldContent>
              <NativeSelect
                value={field.value}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid || deptError}
                className="w-full"
                disabled={deptPending || deptError}
              >
                <NativeSelectOption value="">
                  Select department…
                </NativeSelectOption>
                {departments.map((d) => (
                  <NativeSelectOption key={d.id} value={d.id}>
                    {d.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError
                errors={[
                  fieldState.error,
                  deptError
                    ? {
                        message:
                          deptErrorMessage?.message ?? "Failed to load departments",
                      }
                    : undefined,
                ]}
              />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="duration"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel required>Duration (Years)</FieldLabel>
            <FieldContent>
              <NativeSelect
                value={String(field.value)}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
                className="w-full"
              >
                {COURSE_DURATIONS.map((d) => (
                  <NativeSelectOption key={d} value={String(d)}>
                    {d} Years ({d * 2} Semesters)
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
            <FieldLabel required>Description</FieldLabel>
            <FieldContent>
              <Input
                placeholder="Short overview of the course"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
    </>
  );
}
