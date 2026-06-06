import { queryOptions } from "@tanstack/react-query";
import { fetchEnrolledStudent } from "../lib/action";


export function getEnrolledStudent({UAN, batch}: {UAN: string, batch: string}) {
  return queryOptions({
    queryKey: [
      "enrolled_student",
      UAN,
      batch,
    ],
    queryFn: async () => {
      const res = await fetchEnrolledStudent({UAN, batch});
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}
