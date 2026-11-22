// frontend/pages/dashboard.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DriverDashboard from '../components/DriverDashboard';
import RideHistory from '../components/RideHistory';
import UserProfile from '../components/UserProfile';
import DashboardLayout from '../components/DashboardLayout';
import FareSettingsPanel from '../components/FareSettingsPanel';

export default function Dashboard() {
  const { user, token, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('rides');

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view your dashboard.</div>;

  if (user.role === 'admin') {
    return (
      <DashboardLayout
        user={user}
        left={<div><h2>{user.name || user.email}</h2><p>مدير النظام</p></div>}
        right={<FareSettingsPanel token={token} />}
      />
    );
  }

  let rightPane;
  if (user.role === 'driver') {
    rightPane = <DriverDashboard token={token} />;
  } else if (activeTab === 'rides') {
    rightPane = <RideHistory token={token} />;
  } else if (activeTab === 'payments') {
    rightPane = <div>Payments section (to be implemented)</div>;
  } else if (activeTab === 'profile') {
    rightPane = <UserProfile user={user} />;
  } else if (activeTab === 'settings') {
    rightPane = <div>Settings section (to be implemented)</div>;
  }

  return (
    <DashboardLayout
      user={user}
      left={<UserProfile user={user} activeTab={activeTab} onTabChange={setActiveTab} />}
      right={rightPane}
    />
  );
}
