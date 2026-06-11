import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCourse } from "../lib/action";
import type { AddCourseSchema } from "../lib/zod-type/add-course-type";

export function useAddCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddCourseSchema) => {
      const res = await addCourse(input);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
