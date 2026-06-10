import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBatch } from "../lib/actions";
import type { NewBatchSchema } from "../lib/zod-type/new-batch-type";

export function useMutCreateBatch(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: NewBatchSchema) => {
      const res = await createBatch(courseId, input);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-details", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
