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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconDownload, IconUsers, IconChecklist, IconCash } from "@tabler/icons-react";

interface CollectionTableProps {
  students: any[];
}

export function CollectionTable({ students }: CollectionTableProps) {
  const summary = useMemo(() => {
    let totalStudents = students.length;
    let paidStudents = 0;
    let totalCollected = 0;

    students.forEach((student) => {
      const payment = student.feePayments?.[0];
      if (payment && payment.status === "Success") {
        paidStudents++;
        totalCollected += Number(payment.amount) || 0;
      }
    });

    return {
      totalStudents,
      paidStudents,
      unpaidStudents: totalStudents - paidStudents,
      totalCollected,
    };
  }, [students]);

  const handleExportCSV = () => {
    const headers = [
      "College Roll",
      "UAN",
      "Student Name",
      "Phone",
      "Payment Status",
      "Payment Mode",
      "Amount",
      "Transaction ID",
      "Payment Date",
    ];

    const rows = students.map((student) => {
      const payment = student.feePayments?.[0];
      const status = payment ? payment.status : "Unpaid";
      const amount = payment && payment.status === "Success" ? payment.amount : 0;
      const mode = payment ? payment.paymentMode : "N/A";
      const txnId = payment ? payment.transactionId : "N/A";
      const date = payment ? new Date(payment.createdAt).toLocaleDateString("en-IN") : "N/A";

      return [
        student.collegeRoll,
        student.UAN,
        `"${student.name}"`,
        student.phone,
        status,
        mode,
        amount,
        txnId,
        date,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `fee_collection_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Students</CardTitle>
            <IconChecklist className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{summary.paidStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Students</CardTitle>
            <IconUsers className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.unpaidStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <IconCash className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{summary.totalCollected.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <IconDownload size={16} />
          Export to CSV
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>College Roll</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground h-32">
                  No students found for this selection.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const payment = student.feePayments?.[0];
                const status = payment ? payment.status : "Unpaid";
                
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm">{student.collegeRoll}</TableCell>
                    <TableCell className="font-medium">
                      <div>{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.UAN}</div>
                    </TableCell>
                    <TableCell>
                      {status === "Success" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">Paid</Badge>
                      ) : status === "Pending" ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">Pending</Badge>
                      ) : status === "Failed" ? (
                        <Badge variant="destructive">Failed</Badge>
                      ) : (
                        <Badge variant="secondary">Unpaid</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment && payment.status === "Success" ? `₹${Number(payment.amount).toLocaleString("en-IN")}` : "-"}
                    </TableCell>
                    <TableCell>{payment ? payment.paymentMode : "-"}</TableCell>
                    <TableCell className="font-mono text-xs">{payment ? payment.transactionId : "-"}</TableCell>
                    <TableCell className="text-sm">
                      {payment ? new Date(payment.createdAt).toLocaleDateString("en-IN") : "-"}
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
