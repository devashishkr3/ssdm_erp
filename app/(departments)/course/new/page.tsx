import { CreateCourseForm } from "./main";

export default function CreateCoursePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create Course</h1>
        <p className="text-sm text-muted-foreground">
          Add a new course to the system.
        </p>
      </div>
      <CreateCourseForm />
    </div>
  );
}
