import { prisma } from "@/lib/prisma"
import { addEmployee } from "./actions"
import EmployeeTable from "./components/EmployeeTable"

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="container">
      <div className="header">
        <h1>إدارة الموظفين</h1>
        <p>إضافة وتعديل بيانات ورواتب الموظفين</p>
      </div>

      <div className="grid">
        {/* Form Section */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>إضافة موظف جديد</h2>
          <form action={addEmployee}>
            <div className="form-group">
              <label htmlFor="name">اسم الموظف</label>
              <input type="text" id="name" name="name" className="form-control" placeholder="أدخل اسم الموظف" required />
            </div>

            <div className="form-group">
              <label htmlFor="basicSalary">الراتب الاسمي (د.ع)</label>
              <input type="number" id="basicSalary" name="basicSalary" className="form-control" placeholder="مثال: 350000" required />
            </div>

            <div className="form-group">
              <label htmlFor="allowance">مخصصات النقل والطعام (د.ع)</label>
              <input type="number" id="allowance" name="allowance" className="form-control" defaultValue="100000" required />
            </div>

            <button type="submit" className="btn btn-primary">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              إضافة الموظف
            </button>
          </form>
        </div>

        {/* Table Section */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>سجل الموظفين</h2>
          </div>

          <EmployeeTable employees={employees} />
        </div>
      </div>
    </main>
  );
}
