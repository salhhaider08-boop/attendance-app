"use client"

import React from 'react';

export default function MonthlyPayrollReport({ payrollDataList, monthStr }: { payrollDataList: any[], monthStr: string }) {
  
  const totalSalaries = payrollDataList.reduce((sum, item) => sum + item.finalSalary, 0);

  return (
    <div className="glass-card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0 }}>التقرير الشهري الكلي - {monthStr}</h2>
        <button onClick={() => window.print()} className="btn btn-primary" style={{ background: 'var(--success)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          طباعة تقرير الشهر
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ت</th>
            <th>اسم الموظف</th>
            <th>الراتب الاسمي</th>
            <th>الساعات (عادية/إضافية)</th>
            <th>النقل والطعام</th>
            <th>ديون سابقة</th>
            <th>السلف</th>
            <th>صافي الراتب</th>
          </tr>
        </thead>
        <tbody>
          {payrollDataList.map((data, index) => (
            <tr key={data.employeeId}>
              <td>{index + 1}</td>
              <td style={{ fontWeight: 'bold' }}>{data.employeeName}</td>
              <td>{data.basicSalary.toLocaleString()}</td>
              <td style={{ fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--success)' }}>{data.totalOfficialHours} س</span> / <span style={{ color: 'var(--danger)' }}>{(data.totalOvertimeHours + data.totalFridayHours)} س</span>
              </td>
              <td>{data.allowanceEarned.toLocaleString()}</td>
              <td style={{ color: data.previousDues > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {data.previousDues > 0 ? `+ ${data.previousDues.toLocaleString()}` : '-'}
              </td>
              <td style={{ color: data.advances > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {data.advances > 0 ? `- ${data.advances.toLocaleString()}` : '-'}
              </td>
              <td style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
                {data.finalSalary.toLocaleString()} د.ع
              </td>
            </tr>
          ))}
          {payrollDataList.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد بيانات</td>
            </tr>
          )}
        </tbody>
        {payrollDataList.length > 0 && (
          <tfoot>
            <tr style={{ background: 'rgba(79, 70, 229, 0.1)', borderTop: '2px solid var(--primary)' }}>
              <td colSpan={7} style={{ textAlign: 'left', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
                المجموع الكلي للرواتب:
              </td>
              <td style={{ fontWeight: 'bold', fontSize: '1.4rem', color: 'var(--primary)' }}>
                {totalSalaries.toLocaleString()} د.ع
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      {/* Print Styles for the bulk report */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          body {
            background: white !important;
            color: black !important;
            padding: 0;
            margin: 0;
          }
          .header, nav, form, button, .glass-card > h2 {
            display: none !important;
          }
          .glass-card {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Show the table for printing */
          .table {
            width: 100%;
            border-collapse: collapse;
            direction: rtl;
            font-family: 'Tajawal', sans-serif;
            font-size: 14px;
          }
          .table th, .table td {
            border: 1px solid #cbd5e1;
            padding: 8px;
            color: black !important;
            text-align: right;
          }
          .table th {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-weight: bold;
          }
          
          /* Add a custom print header */
          .print-bulk-header {
            display: block !important;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #333;
          }
        }
        @media screen {
          .print-bulk-header {
            display: none;
          }
        }
      `}</style>
      
      <div className="print-bulk-header">
        التقرير الشهري الكلي لرواتب الموظفين - شهر {monthStr}
      </div>
    </div>
  );
}
