import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchBatchesByCourse } from "@/app/(departments)/course/[id]/lib/action";

export function getBatchesByCourseQuery(courseId: string) {
  return queryOptions({
    queryKey: ["batches", courseId],
    queryFn: async () => {
      const res = await fetchBatchesByCourse(courseId);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
    enabled: !!courseId,
  });
}

export function useGetBatchesByCourse(courseId: string) {
  return useQuery(getBatchesByCourseQuery(courseId));
}
