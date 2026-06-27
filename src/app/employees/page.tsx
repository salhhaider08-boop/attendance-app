export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma"
import AddEmployeeForm from "./components/AddEmployeeForm"
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
          <AddEmployeeForm />
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
