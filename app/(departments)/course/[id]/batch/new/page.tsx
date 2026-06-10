import { notFound } from "next/navigation";
import { fetchCourseById } from "@/app/(departments)/course/[id]/lib/action";
import { getAcademicSessions } from "@/app/(departments)/academic-session/lib/action";
import { CreateBatchForm } from "./main";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CreateBatchPage({ params }: Props) {
  const { id } = await params;

  const [courseRes, sessionsRes] = await Promise.all([
    fetchCourseById(id),
    getAcademicSessions(),
  ]);

  if (!courseRes.success || !courseRes.data) notFound();

  const course = courseRes.data;
  const sessions = sessionsRes.success ? (sessionsRes.data ?? []) : [];

  // Sort batches by createdAt desc — latest first
  const sortedBatches = [...(course.batches ?? [])].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const latestBatch = sortedBatches[0] ?? null;
  const usedSessionIds = sortedBatches.map((b) => b.sessionId);

  // Filter out already-used sessions server-side
  const availableSessions = sessions
    .filter((s) => !usedSessionIds.includes(s.id))
    .map((s) => ({ id: s.id, name: s.name, isActive: s.isActive }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Batch — {course.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {latestBatch
            ? "A new batch will be pre-filled from the latest batch. You can modify subjects and fees if needed."
            : "This is the first batch for this course. Set up the academic session, subjects, and fees."}
        </p>
      </div>

      <CreateBatchForm
        courseId={course.id}
        duration={course.duration}
        availableSessions={availableSessions}
        latestBatch={latestBatch}
      />
    </div>
  );
}

