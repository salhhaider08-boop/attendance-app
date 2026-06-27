import { prisma } from "@/lib/prisma"
import { addBulkAttendance } from "./actions"
import AttendanceTable from "./components/AttendanceTable"
import ExportButton from "./components/ExportButton"

export default async function Home(props: { searchParams: Promise<{ employeeId?: string, month?: string }> }) {
  const searchParams = await props.searchParams;
  
  const employees = await prisma.employee.findMany({
    orderBy: { name: 'asc' }
  });

  const filterEmployeeId = searchParams.employeeId ? parseInt(searchParams.employeeId) : undefined;
  const filterMonthStr = searchParams.month;

  let whereClause: any = {};
  if (filterEmployeeId) {
    whereClause.employeeId = filterEmployeeId;
  }
  if (filterMonthStr) {
    const [year, month] = filterMonthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
    whereClause.date = {
      gte: startDate,
      lte: endDate
    };
  }

  const records = await prisma.attendance.findMany({
    where: whereClause,
    orderBy: { date: 'desc' }
  });

  return (
    <main className="container">
      <div className="header">
        <h1>نظام الحضور والانصراف</h1>
        <p>إدارة ساعات العمل الإضافية والرسمية بشكل مجمع</p>
      </div>

      <div className="grid">
        {/* Form Section */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>إضافة حضور مجمع</h2>
          <form action={addBulkAttendance}>
            <div className="form-group">
              <label htmlFor="employeeId">اسم الموظف</label>
              <select id="employeeId" name="employeeId" className="form-control" required>
                <option value="">اختر الموظف...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startDate">من تاريخ</label>
              <input type="date" id="startDate" name="startDate" className="form-control" required />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">إلى تاريخ</label>
              <input type="date" id="endDate" name="endDate" className="form-control" required />
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
              <input type="checkbox" id="skipFridays" name="skipFridays" style={{ width: '20px', height: '20px' }} defaultChecked />
              <label htmlFor="skipFridays" style={{ margin: 0, cursor: 'pointer' }}>بدون جمعة (استثناء أيام الجمعة تلقائياً)</label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={employees.length === 0}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              إنشاء السجلات (9 ص - 6 م)
            </button>
            {employees.length === 0 && <p style={{color:'var(--danger)', marginTop:'1rem', fontSize:'0.9rem'}}>يجب إضافة موظفين أولاً من صفحة الموظفين</p>}
          </form>
        </div>

        {/* Table Section */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2>سجل الحضور</h2>
            
            <form method="GET" action="/" style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <select name="employeeId" className="form-control" style={{ width: 'auto', padding: '0.5rem' }} defaultValue={filterEmployeeId || ""}>
                <option value="">كل الموظفين</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
              <input type="month" name="month" className="form-control" style={{ width: 'auto', padding: '0.5rem' }} defaultValue={filterMonthStr || ""} />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>فلترة</button>
              {(filterEmployeeId || filterMonthStr) && (
                <a href="/" className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)' }}>إلغاء الفلتر</a>
              )}
            </form>

            <ExportButton />
          </div>

          <AttendanceTable records={records} />
        </div>
      </div>
    </main>
  );
}
