"use client"

import { useState } from "react"
import { syncWithGoogleSheets } from "../actions"

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setSuccess(false);
    
    try {
      const res = await syncWithGoogleSheets();
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("حدث خطأ أثناء المزامنة: " + res.error);
      }
    } catch (err) {
      alert("حدث خطأ غير متوقع");
    }
    
    setLoading(false);
  }

  return (
    <button onClick={handleSync} disabled={loading} className="btn btn-export" style={{ cursor: loading ? 'wait' : 'pointer' }}>
      {loading ? (
        <span>جاري المزامنة...</span>
      ) : success ? (
        <span>تمت المزامنة بنجاح ✓</span>
      ) : (
        <>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          تصدير إلى Google Sheets
        </>
      )}
    </button>
  )
}
