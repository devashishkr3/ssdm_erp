ALTER TABLE "course_session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "course_session" CASCADE;--> statement-breakpoint
ALTER TABLE "subject" DROP CONSTRAINT "type_check";--> statement-breakpoint
ALTER TABLE "batch" DROP CONSTRAINT "batch_courseSessionId_course_session_id_fk";
--> statement-breakpoint
ALTER TABLE "semester" DROP CONSTRAINT "semester_courseSessionId_course_session_id_fk";
--> statement-breakpoint
ALTER TABLE "subject" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subject" ALTER COLUMN "type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "subject" ALTER COLUMN "type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "courseId" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "sessionId" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "semester" ADD COLUMN "batchId" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_sessionId_academic_session_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."academic_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "semester" ADD CONSTRAINT "semester_batchId_batch_id_fk" FOREIGN KEY ("batchId") REFERENCES "public"."batch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" DROP COLUMN "courseSessionId";--> statement-breakpoint
ALTER TABLE "batch" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "semester" DROP COLUMN "courseSessionId";--> statement-breakpoint
ALTER TABLE "subject" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "subject" DROP COLUMN "practicalFee";