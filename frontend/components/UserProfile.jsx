
import React from 'react';
import styles from './UserProfile.module.css';
import { useLanguage } from '../context/LanguageContext';

export default function UserProfile({ user, activeTab, onTabChange }) {
  const { t } = useLanguage();

  return (
    <div>
      <h2>{user.name || user.email}</h2>
      <p>{t('role')}: {t(user.role)}</p>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li
          style={{ cursor: 'pointer', fontWeight: activeTab === 'rides' ? 'bold' : 'normal' }}
          onClick={() => onTabChange('rides')}
        >
          {t('myRides')}
        </li>
        <li
          style={{ cursor: 'pointer', fontWeight: activeTab === 'payments' ? 'bold' : 'normal' }}
          onClick={() => onTabChange('payments')}
        >
          {t('payments')}
        </li>
        <li
          style={{ cursor: 'pointer', fontWeight: activeTab === 'profile' ? 'bold' : 'normal' }}
          onClick={() => onTabChange('profile')}
        >
          {t('profile')}
        </li>
        <li
          style={{ cursor: 'pointer', fontWeight: activeTab === 'settings' ? 'bold' : 'normal' }}
          onClick={() => onTabChange('settings')}
        >
          {t('settings')}
        </li>
      </ul>
    </div>
  );
}
