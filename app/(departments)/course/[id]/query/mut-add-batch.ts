import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBatch } from "../lib/action";
import type { AddBatchSchema } from "../lib/zod-type/add-batch-type";

export function useAddBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddBatchSchema) => {
      const res = await addBatch(input);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["batches", variables.courseId],
      });
    },
  });
}
