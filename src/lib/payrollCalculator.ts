import { prisma } from "@/lib/prisma"

export async function calculateMonthSalary(employee: any, year: number, month: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let nonFridayDaysInMonth = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    if (date.getDay() !== 5) {
      nonFridayDaysInMonth++;
    }
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId: employee.id,
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const dailyAllowance = employee.allowance / nonFridayDaysInMonth;
  const hourlyRate = employee.basicSalary / nonFridayDaysInMonth / 9;
  const overtimeRate = hourlyRate * 2;

  let attendedNonFridays = 0;
  let totalOfficialHours = 0;
  let totalOvertimeHours = 0;
  let totalFridayHours = 0;

  for (const record of attendances) {
    const isFriday = new Date(record.date).getDay() === 5;
    const recordTotalHours = (record.officialHours || 0) + (record.overtimeHours || 0);

    if (isFriday) {
      totalFridayHours += recordTotalHours;
    } else {
      attendedNonFridays++;
      totalOfficialHours += (record.officialHours || 0);
      totalOvertimeHours += (record.overtimeHours || 0);
    }
  }

  const allowanceEarned = attendedNonFridays * dailyAllowance;
  const officialPay = totalOfficialHours * hourlyRate;
  const overtimePay = totalOvertimeHours * overtimeRate;
  const fridayPay = totalFridayHours * overtimeRate;
  const finalSalary = allowanceEarned + officialPay + overtimePay + fridayPay;

  return {
    nonFridayDaysInMonth,
    hourlyRate,
    overtimeRate,
    dailyAllowance,
    attendedNonFridays,
    totalOfficialHours,
    totalOvertimeHours,
    totalFridayHours,
    allowanceEarned,
    officialPay,
    overtimePay,
    fridayPay,
    finalSalary
  };
}
