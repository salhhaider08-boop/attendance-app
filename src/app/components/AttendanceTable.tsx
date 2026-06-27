"use client"

import { useState } from "react"
import { deleteAttendance, updateAttendance } from "../actions"

type Record = {
  id: number
  employeeName: string
  checkIn: Date
  checkOut: Date | null
  officialHours: number | null
  overtimeHours: number | null
  date: Date
}

export default function AttendanceTable({ records }: { records: Record[] }) {
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);

  const formatLocalTime = (date: Date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  return (
    <>
      <div className="table-container" style={{ marginTop: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>الموظف</th>
              <th>التاريخ</th>
              <th>الدخول</th>
              <th>الخروج</th>
              <th>الرسمي</th>
              <th>الإضافي</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>لا توجد سجلات حالياً</td>
              </tr>
            ) : records.map((record) => (
              <tr key={record.id}>
                <td style={{ fontWeight: 500 }}>{record.employeeName}</td>
                <td>{new Date(record.date).toLocaleDateString('ar-EG')}</td>
                <td>
                  <span className="badge badge-success">
                    {new Date(record.checkIn).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>
                <td>
                  {record.checkOut ? (
                    <span className="badge badge-warning">
                      {new Date(record.checkOut).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : '-'}
                </td>
                <td>{record.officialHours?.toFixed(2)} س</td>
                <td style={{ color: record.overtimeHours && record.overtimeHours > 0 ? 'var(--danger)' : 'inherit' }}>
                  {record.overtimeHours?.toFixed(2)} س
                </td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.25rem 0.5rem', width: 'auto', background: '#3b82f6' }}
                    onClick={() => setEditingRecord(record)}
                  >
                    تعديل
                  </button>
                  <form action={deleteAttendance}>
                    <input type="hidden" name="id" value={record.id} />
                    <button type="submit" className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }}>حذف</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingRecord && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>تعديل سجل الحضور</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
              يوم: {new Date(editingRecord.date).toLocaleDateString('ar-EG')} - الموظف: {editingRecord.employeeName}
            </p>
            <form action={(formData) => {
              updateAttendance(formData);
              setEditingRecord(null);
            }}>
              <input type="hidden" name="id" value={editingRecord.id} />
              
              <div className="form-group">
                <label htmlFor="checkIn">وقت الدخول الجديد</label>
                <input 
                  type="datetime-local" 
                  id="checkIn" 
                  name="checkIn" 
                  className="form-control" 
                  defaultValue={formatLocalTime(new Date(editingRecord.checkIn))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkOut">وقت الخروج الجديد</label>
                <input 
                  type="datetime-local" 
                  id="checkOut" 
                  name="checkOut" 
                  className="form-control" 
                  defaultValue={editingRecord.checkOut ? formatLocalTime(new Date(editingRecord.checkOut)) : ''}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary">حفظ التعديلات</button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  style={{ width: '100%' }}
                  onClick={() => setEditingRecord(null)}
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
