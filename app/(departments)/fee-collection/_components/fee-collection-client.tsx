"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/content-layout";
import { useFilterOptions, useFeeCollectionReport, useGlobalFeeStats } from "../query/use-fee-collection";
import { CollectionTable } from "./collection-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, BookOpen, Users, LayoutList, Wallet } from "lucide-react";

export function FeeCollectionClient() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  const { data: globalStats } = useGlobalFeeStats();
  const { data: courses, isLoading: isLoadingOptions } = useFilterOptions();

  const selectedCourse = courses?.find((c) => c.id === selectedCourseId);
  const selectedBatch = selectedCourse?.batches.find((b) => b.id === selectedBatchId);
  const totalSemesters = selectedCourse ? selectedCourse.duration * 2 : 0;

  const { data: reportData, isLoading: isLoadingReport } = useFeeCollectionReport(
    selectedBatchId,
    selectedSemester ? parseInt(selectedSemester) : 0
  );

  return (
    <ContentLayout title="Fee Collection">
      <div className="">
        
        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Courses</p>
                <p className="text-xl font-black text-slate-800">{globalStats?.totalCourses || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <LayoutList size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Batches</p>
                <p className="text-xl font-black text-slate-800">{globalStats?.totalBatches || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Students</p>
                <p className="text-xl font-black text-slate-800">{globalStats?.totalStudents || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Collected Amount</p>
                <p className="text-xl font-black text-slate-800">
                  ₹{(globalStats?.totalCollected || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h1 className="text-2xl font-black mb-6 text-slate-800">Fee Collection Report</h1>

        <Card className="mb-8 border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-wide">
                  Course
                </label>
                <Select
                  value={selectedCourseId}
                  onValueChange={(val) => {
                    setSelectedCourseId(val);
                    setSelectedBatchId("");
                    setSelectedSemester("");
                  }}
                  disabled={isLoadingOptions}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-wide">
                  Session / Batch
                </label>
                <Select
                  value={selectedBatchId}
                  onValueChange={(val) => {
                    setSelectedBatchId(val);
                    setSelectedSemester("");
                  }}
                  disabled={!selectedCourseId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCourse?.batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.academicSession?.name || "Unknown Session"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-wide">
                  Semester
                </label>
                <Select
                  value={selectedSemester}
                  onValueChange={setSelectedSemester}
                  disabled={!selectedBatchId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: totalSemesters }).map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        Semester {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedBatchId && selectedSemester && (
          <div className="mt-8">
            {isLoadingReport ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500 font-medium">Loading report data...</p>
              </div>
            ) : reportData ? (
              <CollectionTable students={reportData} />
            ) : null}
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
