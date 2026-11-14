import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import DriverDashboard from '../components/DriverDashboard';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f4f7f6',
      padding: '30px',
      fontFamily: 'sans-serif',
      direction: 'rtl'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* الشريط العلوي */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#092032',
          color: '#fff',
          padding: '15px 25px',
          borderRadius: '12px',
          marginBottom: '25px'
        }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>لوحة تحكم السائق</h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
              الرئيسية
            </Link>
            {user && (
              <button
                onClick={logout}
                style={{
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                تسجيل الخروج
              </button>
            )}
          </div>
        </div>

        {/* معلومات الحساب */}
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>بيانات السائق</h3>
          {user ? (
            <p style={{ margin: 0, color: '#555' }}>
              <strong>الاسم:</strong> {user.name || user.email} | <strong>الصفة:</strong> سائق
            </p>
          ) : (
            <p style={{ margin: 0, color: '#888' }}>يرجى تسجيل الدخول لعرض بياناتك.</p>
          )}
        </div>

        {/* عرض طلبات الركاب الواردة */}
        <DriverDashboard />

      </div>
    </div>
  );
}