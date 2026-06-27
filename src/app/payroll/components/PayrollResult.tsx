"use client"

import { useState } from "react"
import { markSalaryPaid } from "@/app/actions"

export default function PayrollResult({ payrollData }: { payrollData: any }) {
  const [activeView, setActiveView] = useState<'all' | 'official' | 'allowance' | 'overtime'>('all');

  let displayValue = 0;
  let displayLabel = "";

  if (activeView === 'official') {
    displayValue = payrollData.officialPay;
    displayLabel = "مستحقات الساعات العادية فقط";
  } else if (activeView === 'allowance') {
    displayValue = payrollData.allowanceEarned;
    displayLabel = "مستحقات النقل والطعام فقط";
  } else if (activeView === 'overtime') {
    displayValue = payrollData.overtimePay + payrollData.fridayPay;
    displayLabel = "مستحقات الإضافي والجمعة فقط";
  } else {
    displayValue = payrollData.finalSalary;
    displayLabel = "الراتب النهائي المستحق (الكلي)";
  }

  return (
    <div className="glass-card" style={{ border: '2px solid var(--primary)' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>تفاصيل الراتب: {payrollData.employeeName}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>الراتب الاسمي</p>
          <h3 style={{ fontSize: '1.5rem' }}>{payrollData.basicSalary.toLocaleString()} د.ع</h3>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>أيام الشهر (بدون الجمعة)</p>
          <h3 style={{ fontSize: '1.5rem' }}>{payrollData.nonFridayDaysInMonth} يوم</h3>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>سعر الساعة الرسمي</p>
          <h3 style={{ fontSize: '1.5rem' }}>{payrollData.hourlyRate.toLocaleString(undefined, {maximumFractionDigits: 2})} د.ع</h3>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>سعر الساعة الإضافي</p>
          <h3 style={{ fontSize: '1.5rem' }}>{payrollData.overtimeRate.toLocaleString(undefined, {maximumFractionDigits: 2})} د.ع</h3>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button 
          className="btn" 
          style={{ flex: 1, background: activeView === 'official' ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}
          onClick={() => setActiveView('official')}
        >
          الساعات العادية
        </button>
        <button 
          className="btn" 
          style={{ flex: 1, background: activeView === 'allowance' ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}
          onClick={() => setActiveView('allowance')}
        >
          النقل والطعام
        </button>
        <button 
          className="btn" 
          style={{ flex: 1, background: activeView === 'overtime' ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}
          onClick={() => setActiveView('overtime')}
        >
          الإضافي والجمعة
        </button>
        <button 
          className="btn" 
          style={{ flex: 1, background: activeView === 'all' ? 'var(--success)' : 'rgba(255,255,255,0.1)' }}
          onClick={() => setActiveView('all')}
        >
          عرض الكل
        </button>
      </div>

      <table className="table" style={{ marginBottom: '1.5rem' }}>
        <tbody>
          <tr style={{ opacity: activeView === 'all' || activeView === 'official' ? 1 : 0.3 }}>
            <td>ساعات الدوام الرسمية المستحقة ({payrollData.totalOfficialHours} س)</td>
            <td style={{ fontWeight: 'bold' }}>{payrollData.officialPay.toLocaleString(undefined, {maximumFractionDigits: 0})} د.ع</td>
          </tr>
          <tr style={{ opacity: activeView === 'all' || activeView === 'overtime' ? 1 : 0.3 }}>
            <td>الساعات الإضافية ({payrollData.totalOvertimeHours} س)</td>
            <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>+ {payrollData.overtimePay.toLocaleString(undefined, {maximumFractionDigits: 0})} د.ع</td>
          </tr>
          <tr style={{ opacity: activeView === 'all' || activeView === 'overtime' ? 1 : 0.3 }}>
            <td>دوام الجمعة ({payrollData.totalFridayHours} س)</td>
            <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>+ {payrollData.fridayPay.toLocaleString(undefined, {maximumFractionDigits: 0})} د.ع</td>
          </tr>
          <tr style={{ opacity: activeView === 'all' || activeView === 'allowance' ? 1 : 0.3 }}>
            <td>مخصصات مستحقة ({payrollData.attendedNonFridays} يوم حضور)</td>
            <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>+ {payrollData.allowanceEarned.toLocaleString(undefined, {maximumFractionDigits: 0})} د.ع</td>
          </tr>
          {payrollData.previousDues > 0 && activeView === 'all' && (
            <tr style={{ background: 'rgba(255, 68, 68, 0.1)' }}>
              <td>
                ديون سابقة مستحقة (لم تسلم)
                <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
                  عن أشهر: {payrollData.unpaidMonthsList.join(' , ')}
                </div>
              </td>
              <td style={{ fontWeight: 'bold', color: 'var(--danger)' }}>+ {payrollData.previousDues.toLocaleString(undefined, {maximumFractionDigits: 0})} د.ع</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ background: activeView === 'all' ? (payrollData.isPaid ? 'var(--success)' : 'var(--primary)') : 'rgba(255,255,255,0.1)', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', transition: 'all 0.3s ease' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', opacity: 0.9 }}>
          {displayLabel}
          {activeView === 'all' && payrollData.isPaid && " (تم التسليم ✓)"}
        </p>
        <h1 style={{ fontSize: '3rem', margin: 0, color: activeView === 'all' ? 'white' : 'var(--primary)' }}>
          {displayValue.toLocaleString(undefined, {maximumFractionDigits: 0})} د.ع
        </h1>
      </div>

      {activeView === 'all' && !payrollData.isPaid && (
        <form action={markSalaryPaid} style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <input type="hidden" name="employeeId" value={payrollData.employeeId} />
          <input type="hidden" name="month" value={payrollData.monthStr} />
          <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '50px', background: 'var(--success)' }}>
            تسليم الراتب
          </button>
        </form>
      )}
    </div>
  )
}
