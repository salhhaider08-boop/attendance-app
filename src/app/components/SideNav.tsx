"use client"

import { useRouter } from 'next/navigation'

export default function SideNav() {
  const router = useRouter();

  return (
    <>
      <button 
        onClick={() => router.back()} 
        style={{
          position: 'fixed',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          zIndex: 9999,
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          color: 'var(--text-main)',
          fontSize: '1.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        title="رجوع"
      >
        &#8594;
      </button>

      <button 
        onClick={() => router.forward()} 
        style={{
          position: 'fixed',
          top: '50%',
          left: '20px',
          transform: 'translateY(-50%)',
          zIndex: 9999,
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          color: 'var(--text-main)',
          fontSize: '1.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        title="تقدم"
      >
        &#8592;
      </button>
    </>
  )
}
