import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { CourseContent } from "./_components/course-content";
import { getCoursesQuery } from "./query/get-courses";
import { getDepartment } from "@/app/(departments)/department/query/get-all-department";

export default async function CoursePage() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(getCoursesQuery()),
    queryClient.prefetchQuery(getDepartment()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Manage courses and link them to departments.
          </p>
        </div>
        <CourseContent />
      </main>
    </HydrationBoundary>
  );
}
