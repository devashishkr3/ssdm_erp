import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/app/(departments)/course/lib/action";

export function getCoursesQuery() {
  return queryOptions({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetchCourses();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}

export function useGetCourses() {
  return useQuery(getCoursesQuery());
}
