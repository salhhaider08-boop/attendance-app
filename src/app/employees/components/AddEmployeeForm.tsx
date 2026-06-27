"use client"

import { useState } from "react"
import { addEmployee } from "../actions"

export default function AddEmployeeForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      const res = await addEmployee(formData);
      if (res?.error) {
        setError(res.error);
        alert("خطأ: " + res.error);
      } else {
        // success
        const form = document.getElementById("add-employee-form") as HTMLFormElement;
        if (form) form.reset();
        alert("تمت إضافة الموظف بنجاح!");
      }
    } catch (err: any) {
      setError("حدث خطأ غير متوقع");
      alert("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="add-employee-form" action={handleSubmit}>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.5rem', background: '#ffebee', borderRadius: '4px' }}>{error}</div>}
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

      <button type="submit" className="btn btn-primary" disabled={loading}>
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {loading ? "جاري الإضافة..." : "إضافة الموظف"}
      </button>
    </form>
  )
}
