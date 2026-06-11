import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchCourseById } from "@/app/(departments)/course/[id]/lib/action";

export function getCourseByIdQuery(courseId: string) {
  return queryOptions({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetchCourseById(courseId);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
    enabled: !!courseId,
  });
}

export function useGetCourseById(courseId: string) {
  return useQuery(getCourseByIdQuery(courseId));
}
