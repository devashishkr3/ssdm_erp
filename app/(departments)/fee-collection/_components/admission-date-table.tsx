"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconDownload } from "@tabler/icons-react";

interface AdmissionDateTableProps {
  students: any[];
}

export function AdmissionDateTable({ students }: AdmissionDateTableProps) {
  const summary = useMemo(() => {
    let totalFee = 0;
    let paidCount = 0;

    students.forEach((student) => {
      const successPayment = student.feePayments?.find(
        (p: any) => p.status === "Success",
      );
      if (successPayment) {
        paidCount++;
        totalFee += Number(successPayment.amount) || 0;
      }
    });

    return { totalFee, paidCount, unpaidCount: students.length - paidCount };
  }, [students]);

  const handleExportCSV = () => {
    const headers = [
      "S.No",
      "College Roll",
      "UAN",
      "Student Name",
      "Phone",
      "Gender",
      "Caste",
      "Payment Status",
      "Fee Paid",
      "Payment Mode",
      "Transaction ID",
      "Admission Date",
    ];

    const rows = students.map((student, index) => {
      const payment = student.feePayments?.find(
        (p: any) => p.status === "Success",
      );
      const isPaid = !!payment;

      return [
        index + 1,
        student.collegeRoll,
        student.UAN,
        `"${student.name}"`,
        student.phone,
        student.gender,
        student.caste,
        isPaid ? "Paid" : "Unpaid",
        isPaid ? payment.amount : 0,
        isPaid ? payment.paymentMode : "N/A",
        isPaid ? payment.transactionId : "N/A",
        new Date(student.createdAt).toLocaleDateString("en-IN"),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `admissions_report_${new Date().getTime()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Admissions List
          </h2>
          <p className="text-sm text-slate-500">
            {students.length} total — {summary.paidCount} paid, {summary.unpaidCount} unpaid — Fee Collected: ₹{summary.totalFee.toLocaleString("en-IN")}
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="gap-2"
          disabled={students.length === 0}
        >
          <IconDownload size={16} />
          Export to CSV
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">S.No</TableHead>
              <TableHead>College Roll</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fee Paid</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Admission Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center text-muted-foreground h-32"
                >
                  No admissions found for the selected date.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student, index) => {
                const payment = student.feePayments?.find(
                  (p: any) => p.status === "Success",
                );
                const isPaid = !!payment;

                return (
                  <TableRow key={student.id}>
                    <TableCell className="text-sm text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {student.collegeRoll}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.UAN}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{student.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {student.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isPaid ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Unpaid</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-700">
                      {isPaid
                        ? `₹${Number(payment.amount).toLocaleString("en-IN")}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {isPaid ? payment.paymentMode : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {isPaid ? payment.transactionId : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(student.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
