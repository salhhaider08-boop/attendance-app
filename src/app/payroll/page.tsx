import { prisma } from "@/lib/prisma"
import { calculateMonthSalary } from "@/lib/payrollCalculator"
import PayrollResult from "./components/PayrollResult"

import MonthlyPayrollReport from "./components/MonthlyPayrollReport"

async function getPayrollData(employee: any, year: number, month: number, monthStr: string, advances: number = 0) {
  const {
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
    finalSalary: currentMonthSalary
  } = await calculateMonthSalary(employee, year, month);

  // Check current month status
  const currentStatus = await prisma.salaryStatus.findUnique({
    where: { employeeId_month: { employeeId: employee.id, month: monthStr } }
  });
  const isPaid = currentStatus?.isPaid || false;

  // Calculate previous dues (unpaid past months)
  let previousDues = 0;
  let unpaidMonthsList: string[] = [];
  
  const firstAttendance = await prisma.attendance.findFirst({
    where: { employeeId: employee.id },
    orderBy: { date: 'asc' }
  });
  
  let loopYear = year;
  let loopMonth = month;

  if (firstAttendance) {
    const firstDate = new Date(firstAttendance.date);
    loopYear = firstDate.getFullYear();
    loopMonth = firstDate.getMonth() + 1;
  } else {
    const creationDate = new Date(employee.createdAt);
    loopYear = creationDate.getFullYear();
    loopMonth = creationDate.getMonth() + 1;
  }

  while (loopYear < year || (loopYear === year && loopMonth < month)) {
    const checkMonthStr = `${loopYear}-${loopMonth.toString().padStart(2, '0')}`;
    
    const status = await prisma.salaryStatus.findUnique({
      where: { employeeId_month: { employeeId: employee.id, month: checkMonthStr } }
    });

    if (!status || !status.isPaid) {
      const pastCalc = await calculateMonthSalary(employee, loopYear, loopMonth);
      if (pastCalc.finalSalary > 0) {
        previousDues += pastCalc.finalSalary;
        unpaidMonthsList.push(checkMonthStr);
      }
    }

    loopMonth++;
    if (loopMonth > 12) {
      loopMonth = 1;
      loopYear++;
    }
  }

  const finalSalary = currentMonthSalary + previousDues - advances;

  return {
    employeeId: employee.id,
    monthStr,
    employeeName: employee.name,
    basicSalary: employee.basicSalary,
    allowance: employee.allowance,
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
    currentMonthSalary,
    previousDues,
    unpaidMonthsList,
    advances,
    finalSalary,
    isPaid
  };
}

export default async function PayrollPage(props: { searchParams: Promise<{ employeeId?: string, month?: string, advances?: string }> }) {
  const searchParams = await props.searchParams;
  const employees = await prisma.employee.findMany({ orderBy: { name: 'asc' } });

  const isAllEmployees = searchParams.employeeId === 'all';
  const employeeId = searchParams.employeeId && !isAllEmployees ? parseInt(searchParams.employeeId) : null;
  const monthStr = searchParams.month; // format "YYYY-MM"
  const advances = searchParams.advances ? parseFloat(searchParams.advances) : 0;

  let payrollData = null;
  let bulkPayrollDataList = null;

  if (monthStr) {
    const [year, month] = monthStr.split('-').map(Number);
    
    if (isAllEmployees) {
      bulkPayrollDataList = [];
      for (const emp of employees) {
        // We pass 0 advances for bulk report since advances are not persisted in DB
        const data = await getPayrollData(emp, year, month, monthStr, 0);
        bulkPayrollDataList.push(data);
      }
    } else if (employeeId) {
      const employee = employees.find(e => e.id === employeeId);
      if (employee) {
        payrollData = await getPayrollData(employee, year, month, monthStr, advances);
      }
    }
  }

  return (
    <main className="container">
      <div className="header">
        <h1>حساب الرواتب</h1>
        <p>توليد الراتب النهائي بناءً على الحضور والمخصصات</p>
      </div>

      <div className="grid">
        <div className="glass-card">
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>استخراج راتب موظف أو تقرير كلي</h2>
          <form method="GET" action="/payroll">
            <div className="form-group">
              <label htmlFor="employeeId">اسم الموظف أو التقرير الكلي</label>
              <select id="employeeId" name="employeeId" className="form-control" defaultValue={searchParams.employeeId || ""} required>
                <option value="">اختر...</option>
                <option value="all" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>التقرير الشهري الكلي (جميع الموظفين)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="month">الشهر</label>
              <input type="month" id="month" name="month" className="form-control" defaultValue={monthStr || ""} required />
            </div>

            {!isAllEmployees && (
              <div className="form-group">
                <label htmlFor="advances">السلف المسحوبة (إن وجدت)</label>
                <input type="number" id="advances" name="advances" className="form-control" defaultValue={advances || ""} placeholder="أدخل مبلغ السلف (د.ع) - للتقرير الفردي فقط" />
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={employees.length === 0}>
              استخراج
            </button>
            {employees.length === 0 && <p style={{color:'var(--danger)', marginTop:'1rem', fontSize:'0.9rem'}}>يجب إضافة موظفين أولاً</p>}
          </form>
        </div>

        {payrollData && !isAllEmployees && (
          <PayrollResult payrollData={payrollData} />
        )}
      </div>

      {isAllEmployees && bulkPayrollDataList && (
        <MonthlyPayrollReport payrollDataList={bulkPayrollDataList} monthStr={monthStr} />
      )}
    </main>
  );
}
