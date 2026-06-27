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

      {activeView === 'all' && (
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {!payrollData.isPaid && (
            <form action={markSalaryPaid}>
              <input type="hidden" name="employeeId" value={payrollData.employeeId} />
              <input type="hidden" name="month" value={payrollData.monthStr} />
              <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '50px', background: 'var(--success)' }}>
                تسليم الراتب
              </button>
            </form>
          )}
          
          <button onClick={() => window.print()} className="btn" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '8px' }}>
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            طباعة التقرير
          </button>
        </div>
      )}

      {/* Print Only Section */}
      <style>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 1cm;
          }
          
          /* Hide main app elements */
          .header, nav, .grid > div:first-child {
            display: none !important;
          }
          
          /* Reset body and wrappers */
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .container, .grid {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          
          /* Reset the PayrollResult card to be invisible container */
          .glass-card {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Hide everything inside PayrollResult EXCEPT the print-container */
          .glass-card > h2,
          .glass-card > div:not(.print-container),
          .glass-card > table,
          .glass-card > form {
            display: none !important;
          }

          .print-container {
            display: block !important;
            width: 100%;
            padding: 10px;
            direction: rtl;
            background: white;
            font-family: 'Tajawal', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-header {
            text-align: center;
            font-size: 32px;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #3b82f6;
          }
          .print-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
            padding: 14px 10px;
            font-size: 18px;
            color: #334155;
          }
          .print-bold {
            font-weight: 700;
            font-size: 20px;
            color: #0f172a;
          }
          .print-salary-box {
            background: linear-gradient(135deg, rgba(239, 246, 255, 0.9), rgba(219, 234, 254, 0.8));
            border: 2px solid #93c5fd;
            border-radius: 16px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
          }
          .print-salary-title {
            font-size: 20px;
            color: #475569;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .print-salary-amount {
            font-size: 46px;
            font-weight: 900;
            color: #1d4ed8;
            margin: 0;
          }
          .print-dues {
            background: #fee2e2;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            padding: 10px 15px;
            margin-top: 15px;
            display: inline-block;
            color: #b91c1c;
            font-weight: bold;
            font-size: 18px;
          }
        }
        @media screen {
          .print-container {
            display: none;
          }
        }
      `}</style>

      <div className="print-container">
        <div className="print-header">تقرير راتب موظف</div>
        
        <div className="print-row print-bold" style={{ borderBottom: 'none' }}>
          <span>الاسم: <span style={{ color: '#2563eb' }}>{payrollData.employeeName}</span></span>
          <span>تاريخ الراتب: <span style={{ color: '#2563eb' }}>{payrollData.monthStr}</span></span>
        </div>
        
        <div className="print-salary-box">
          <div className="print-salary-title">الراتب الكلي المستحق</div>
          <div className="print-salary-amount">{payrollData.finalSalary.toLocaleString(undefined, {maximumFractionDigits: 0})} د.ع</div>
          {payrollData.previousDues > 0 && (
            <div className="print-dues">
              + ديون سابقة للأشهر ({payrollData.unpaidMonthsList.join(' , ')}): {payrollData.previousDues.toLocaleString(undefined, {maximumFractionDigits: 0})} د.ع
            </div>
          )}
        </div>

        <div className="print-row">
          <span>النقل والطعام:</span>
          <span className="print-bold">{payrollData.allowanceEarned.toLocaleString(undefined, {maximumFractionDigits: 0})} د.ع</span>
        </div>
        
        <div className="print-row">
          <span>الساعات الإضافية والجمعة:</span>
          <span className="print-bold">{(payrollData.overtimePay + payrollData.fridayPay).toLocaleString(undefined, {maximumFractionDigits: 0})} د.ع</span>
        </div>

        <div className="print-row">
          <span>سعر الساعة العادية:</span>
          <span className="print-bold">{payrollData.hourlyRate.toLocaleString(undefined, {maximumFractionDigits: 2})} د.ع</span>
        </div>

        <div className="print-row">
          <span>عدد الساعات العادية:</span>
          <span className="print-bold">{payrollData.totalOfficialHours.toLocaleString(undefined, {maximumFractionDigits: 1})} ساعة</span>
        </div>

        <div className="print-row" style={{ borderBottom: 'none' }}>
          <span>عدد الساعات الإضافية والجمعة:</span>
          <span className="print-bold">{(payrollData.totalOvertimeHours + payrollData.totalFridayHours).toLocaleString(undefined, {maximumFractionDigits: 1})} ساعة</span>
        </div>
      </div>
    </div>
  )
}
