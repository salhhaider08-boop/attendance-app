import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const attendances = await prisma.attendance.findMany({
      orderBy: { date: 'desc' }
    });

    // Create CSV header
    let csv = "رقم الموظف,اسم الموظف,وقت الدخول,وقت الخروج,الساعات الرسمية,الساعات الإضافية,تاريخ التسجيل\n";

    // Add rows
    attendances.forEach(a => {
      const checkIn = new Date(a.checkIn).toLocaleString('ar-EG');
      const checkOut = a.checkOut ? new Date(a.checkOut).toLocaleString('ar-EG') : '';
      const date = new Date(a.date).toLocaleDateString('ar-EG');
      
      csv += `${a.id},"${a.employeeName}","${checkIn}","${checkOut}",${a.officialHours?.toFixed(2) || 0},${a.overtimeHours?.toFixed(2) || 0},"${date}"\n`;
    });

    // BOM for UTF-8 to support Arabic in Excel/Google Sheets
    const bom = '\uFEFF';

    return new NextResponse(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="attendance_export.csv"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Error exporting data", { status: 500 });
  }
}
