import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCourse } from "../lib/actions";
import type { NewCourseSchema } from "../lib/zod-type/new-course-type";

export function useMutCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: NewCourseSchema) => {
      const res = await createCourse(input);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
