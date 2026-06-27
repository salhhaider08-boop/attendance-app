"use client"

import { useState } from "react"
import { deleteEmployee, updateEmployee } from "../actions"

type Employee = {
  id: number
  name: string
  basicSalary: number
  allowance: number
}

export default function EmployeeTable({ employees }: { employees: Employee[] }) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  return (
    <>
      <div className="table-container" style={{ marginTop: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>رقم الموظف</th>
              <th>الاسم</th>
              <th>الراتب الاسمي</th>
              <th>المخصصات (الشهرية)</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>لا يوجد موظفين حالياً</td>
              </tr>
            ) : employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td style={{ fontWeight: 500 }}>{emp.name}</td>
                <td>{emp.basicSalary.toLocaleString()} د.ع</td>
                <td>{emp.allowance.toLocaleString()} د.ع</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.25rem 0.5rem', width: 'auto', background: '#3b82f6' }}
                    onClick={() => setEditingEmployee(emp)}
                  >
                    تعديل الراتب
                  </button>
                  <form action={deleteEmployee}>
                    <input type="hidden" name="id" value={emp.id} />
                    <button type="submit" className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }}>حذف</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingEmployee && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>تعديل بيانات الموظف</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
              الموظف: {editingEmployee.name}
            </p>
            <form action={(formData) => {
              updateEmployee(formData);
              setEditingEmployee(null);
            }}>
              <input type="hidden" name="id" value={editingEmployee.id} />
              
              <div className="form-group">
                <label htmlFor="basicSalary">الراتب الاسمي (د.ع)</label>
                <input 
                  type="number" 
                  id="basicSalary" 
                  name="basicSalary" 
                  className="form-control" 
                  defaultValue={editingEmployee.basicSalary}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="allowance">مخصصات نقل وطعام (د.ع)</label>
                <input 
                  type="number" 
                  id="allowance" 
                  name="allowance" 
                  className="form-control" 
                  defaultValue={editingEmployee.allowance}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary">حفظ التعديلات</button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  style={{ width: '100%' }}
                  onClick={() => setEditingEmployee(null)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
