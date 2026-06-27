"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

function calculateHours(checkIn: Date, checkOut: Date) {
  const officialStart = new Date(checkIn);
  officialStart.setHours(9, 0, 0, 0);

  const officialEnd = new Date(checkIn);
  officialEnd.setHours(18, 0, 0, 0);

  let officialMs = 0;
  let overtimeMs = 0;

  const actualStartMs = checkIn.getTime();
  const actualEndMs = checkOut.getTime();
  const offStartMs = officialStart.getTime();
  const offEndMs = officialEnd.getTime();

  if (actualStartMs < offStartMs) {
    overtimeMs += (Math.min(actualEndMs, offStartMs) - actualStartMs);
  }

  if (actualEndMs > offEndMs) {
    overtimeMs += (actualEndMs - Math.max(actualStartMs, offEndMs));
  }

  const overlapStart = Math.max(actualStartMs, offStartMs);
  const overlapEnd = Math.min(actualEndMs, offEndMs);

  if (overlapEnd > overlapStart) {
    officialMs = overlapEnd - overlapStart;
  }

  const officialHours = officialMs / (1000 * 60 * 60);
  const overtimeHours = overtimeMs / (1000 * 60 * 60);

  return { officialHours, overtimeHours };
}

export async function addBulkAttendance(formData: FormData) {
  const employeeId = parseInt(formData.get("employeeId") as string);
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const skipFridays = formData.get("skipFridays") === "on";

  if (!employeeId || !startDateStr || !endDateStr) {
    throw new Error("جميع الحقول مطلوبة");
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    throw new Error("الموظف غير موجود");
  }
  const employeeName = employee.name;

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (endDate < startDate) {
    throw new Error("تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية");
  }

  const recordsToInsert = [];

  let currentDate = new Date(startDate);
  // Remove time part to avoid daylight saving issues during iteration
  currentDate.setHours(0,0,0,0);
  endDate.setHours(0,0,0,0);

  while (currentDate <= endDate) {
    if (skipFridays && currentDate.getDay() === 5) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const checkIn = new Date(currentDate);
    checkIn.setHours(9, 0, 0, 0);

    const checkOut = new Date(currentDate);
    checkOut.setHours(18, 0, 0, 0);

    const { officialHours, overtimeHours } = calculateHours(checkIn, checkOut);

    recordsToInsert.push({
      employeeId,
      employeeName,
      checkIn,
      checkOut,
      officialHours,
      overtimeHours,
      date: new Date(currentDate),
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  await prisma.attendance.createMany({
    data: recordsToInsert
  });

  revalidatePath("/");
}

export async function updateAttendance(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const checkInStr = formData.get("checkIn") as string;
  const checkOutStr = formData.get("checkOut") as string;

  if (!id || !checkInStr || !checkOutStr) {
    throw new Error("جميع الحقول مطلوبة");
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  if (checkOut <= checkIn) {
    throw new Error("وقت الخروج يجب أن يكون بعد وقت الدخول");
  }

  const { officialHours, overtimeHours } = calculateHours(checkIn, checkOut);

  await prisma.attendance.update({
    where: { id },
    data: {
      checkIn,
      checkOut,
      officialHours,
      overtimeHours,
    }
  });

  revalidatePath("/");
}

export async function deleteAttendance(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  await prisma.attendance.delete({
    where: { id }
  });
  revalidatePath("/");
}

export async function syncWithGoogleSheets() {
  try {
    const records = await prisma.attendance.findMany({
      orderBy: { date: 'asc' }
    });

    const data = [
      ["رقم السجل", "اسم الموظف", "التاريخ", "الدخول", "الخروج", "ساعات رسمية", "ساعات إضافية"]
    ];

    for (const record of records) {
      data.push([
        record.id.toString(),
        record.employeeName,
        new Date(record.date).toLocaleDateString('ar-EG'),
        new Date(record.checkIn).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        record.checkOut ? new Date(record.checkOut).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-',
        record.officialHours ? record.officialHours.toFixed(2) : '0',
        record.overtimeHours ? record.overtimeHours.toFixed(2) : '0'
      ]);
    }

    const scriptUrl = "https://script.google.com/macros/s/AKfycbynYZ5nfIgepmJWBRlQzb2ZK50C5I13u-L5y83ozJ_ljB3B5g9GAy9P1DBQBHnnZaMejQ/exec";

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error("فشل الاتصال بجوجل شيت");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Sync Error:", error);
    return { success: false, error: error.message };
  }
}

export async function markSalaryPaid(formData: FormData) {
  const employeeId = parseInt(formData.get("employeeId") as string);
  const month = formData.get("month") as string;

  if (!employeeId || !month) {
    throw new Error("بيانات غير مكتملة");
  }

  await prisma.salaryStatus.upsert({
    where: {
      employeeId_month: {
        employeeId,
        month
      }
    },
    update: {
      isPaid: true
    },
    create: {
      employeeId,
      month,
      isPaid: true
    }
  });

  revalidatePath("/payroll");
}
