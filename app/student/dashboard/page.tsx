import {
  IconAlertCircle,
  IconAward,
  IconCalendar,
  IconMail,
  IconPhone,
  IconSchool,
  IconUser,
} from "@tabler/icons-react";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/content-layout";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdmittedStudentTable, batchTable } from "@/lib/db/schema";

export default async function StudentDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "student") {
    redirect("/auth/signin");
  }

  const email = session.user.email;

  // Find admitted student record matching authenticated email
  let student = await db.query.AdmittedStudentTable.findFirst({
    where: eq(AdmittedStudentTable.email, email),
  });

  // If not found and using student UAN email format, extract UAN and search
  if (!student && email.endsWith("@student.ssdm.local")) {
    const uan = email.split("@")[0].toUpperCase();
    student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, uan),
    });
  }

  // If no student profile exists in AdmittedStudentTable
  if (!student) {
    return (
      <ContentLayout title="Dashboard">
        <div className="max-w-xl mx-auto mt-12 bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <IconAlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Admitted Profile Not Found
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              Your login credentials are not currently linked with any active
              student record in the database. Please verify your admission
              registration status with the college administrator.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-50 flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Authenticated Email
            </span>
            <span className="px-4 py-1.5 bg-slate-50 rounded-full font-mono text-xs font-bold text-slate-600 border border-slate-150">
              {email}
            </span>
          </div>
        </div>
      </ContentLayout>
    );
  }

  // Fetch batch details
  const batch = await db.query.batchTable.findFirst({
    where: eq(batchTable.id, student.batchId),
    with: { course: true, academicSession: true },
  });

  return (
    <ContentLayout title="Student Dashboard">
      <div className="max-w-5xl mx-auto space-y-8 p-1 sm:p-4">
        {/* Welcome Premium Gradient Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-8 sm:p-10 shadow-2xl border border-indigo-950">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-300 via-blue-900 to-transparent"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-semibold text-indigo-200">
                <IconSchool className="h-3.5 w-3.5" />
                {student.isPassed
                  ? "Graduated Profile"
                  : "Active Admission Profile"}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-100">
                Welcome back, {student.name}!
              </h1>
              <p className="text-slate-300 text-sm max-w-lg font-medium">
                {student.isPassed
                  ? "View your course records, transaction receipts, and final certification status from your portal."
                  : "Keep track of your course progress, manage tuition and exam fees, and print official college receipts from your portal."}
              </p>
            </div>

            {/* Quick Profile Info Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl md:min-w-[320px] text-xs font-medium">
              <div>
                <span className="text-indigo-200/70 block uppercase tracking-wider text-[9px] font-bold">
                  College Roll
                </span>
                <span className="font-mono text-white text-sm font-bold mt-0.5 block">
                  {student.collegeRoll}
                </span>
              </div>
              <div>
                <span className="text-indigo-200/70 block uppercase tracking-wider text-[9px] font-bold">
                  UAN Reference
                </span>
                <span className="font-mono text-white text-sm font-bold mt-0.5 block">
                  {student.UAN}
                </span>
              </div>
              <div className="col-span-2 border-t border-white/10 pt-2.5 mt-1">
                <span className="text-indigo-200/70 block uppercase tracking-wider text-[9px] font-bold">
                  Current Course & Batch
                </span>
                <span className="text-slate-100 font-semibold mt-0.5 block truncate">
                  {batch?.course?.name || "B.A./B.Sc./B.Com"} (
                  {batch?.academicSession?.name || "N/A"})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Passed & Completed Course Congratulations Card */}
        {student.isPassed && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-200/60 p-6 sm:p-8 shadow-xl">
            <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-400 to-transparent"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
              <div className="h-14 w-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 animate-bounce">
                <IconAward className="h-8 w-8" />
              </div>
              <div className="text-center sm:text-left space-y-1.5 flex-grow">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-extrabold uppercase tracking-widest rounded-full">
                  Course Completed
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Congratulations, {student.name}!
                </h2>
                <p className="text-slate-650 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
                  You have successfully passed all academic requirements and
                  completed your program
                  <span className="font-extrabold text-slate-800">
                    {" "}
                    {batch?.course?.name || "B.Sc"} (
                    {batch?.academicSession?.name || "N/A"})
                  </span>
                  . Your hard work and dedication have earned you this
                  accomplishment. We wish you the absolute best in all your
                  future endeavors!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Academic Profile Details Full-width Grid */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <IconUser className="h-5 w-5 text-indigo-600" />
            Academic Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <IconSchool className="h-5 w-5" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  Current Semester
                </span>
                <span className="text-slate-800 font-extrabold text-sm mt-0.5 block">
                  Semester {student.currentSemesterCount}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <IconCalendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  Academic Session
                </span>
                <span className="text-slate-800 font-extrabold text-sm mt-0.5 block">
                  {batch?.academicSession?.name || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 overflow-hidden">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <IconMail className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  Personal Email
                </span>
                <span className="text-slate-800 font-extrabold text-xs sm:text-sm mt-0.5 block truncate">
                  {student.email}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <IconPhone className="h-5 w-5" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  Mobile Number
                </span>
                <span className="text-slate-800 font-extrabold text-sm mt-0.5 block">
                  {student.phone || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
