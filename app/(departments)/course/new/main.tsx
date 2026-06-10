"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { newCourseSchema, type NewCourseSchema } from "./lib/zod-type/new-course-type";
import { useMutCreateCourse } from "./query/mut-create-course";
import { CourseBasicRow } from "./_components/course-basic-row";
import { CourseDetailRow } from "./_components/course-detail-row";

export function CreateCourseForm() {
  const router = useRouter();
  const createCourse = useMutCreateCourse();

  const form = useForm<NewCourseSchema>({
    resolver: zodResolver(newCourseSchema) as never,
    defaultValues: {
      name: "",
      code: "",
      type: "UG Regular",
      description: "",
      departmentId: "",
      duration: 4,
    },
  });

  async function onSubmit(values: NewCourseSchema) {
    try {
      await createCourse.mutateAsync(values);
      router.push("/department");
    } catch {
      // error is rendered via createCourse.error below
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader className="gap-2">
          <CardTitle>
            <h4>Course Details</h4>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <CourseBasicRow form={form} />
            <CourseDetailRow form={form} />
          </div>
        </CardContent>

        {createCourse.error && (
          <div className="px-6 pb-2">
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertDescription>{createCourse.error.message}</AlertDescription>
            </Alert>
          </div>
        )}

        <CardFooter className="justify-center">
          <Button
            disabled={createCourse.isPending}
            type="submit"
            size="lg"
            className="px-8 text-base"
          >
            {createCourse.isPending ? "Creating..." : "Create Course"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
