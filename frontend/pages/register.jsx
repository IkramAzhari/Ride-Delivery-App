
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import styles from '../components/AuthForm.module.css';

export default function Register() {
  const router = useRouter();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [role, setRole] = useState('rider');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();

      if (data.success) {
        router.push('/login');
      } else {
        setError(data.error || t('registrationFailed'));
      }
    } catch {
      setError(t('serverError'));
    }
  };

  return (
    <div className={styles.authPage} dir="auto">
      <div className={styles.authCard}>
        <h1 className={styles.title}>
          {t('createAccountTitle')}
        </h1>

        <p className={styles.subtitle}>
          {t('registerDescription')}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <div className={styles.label}>{t('fullName')}</div>
            <input
              className={styles.input}
              type="text"
              placeholder={t('yourName')}
              value={name}
              required
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <div className={styles.label}>{t('role')}</div>
            <select
              className={styles.input}
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="rider">{t('rider')}</option>
              <option value="driver">{t('driver')}</option>
            </select>
          </div>

          <div>
            <div className={styles.label}>{t('email')}</div>
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              required
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className={styles.label}>{t('password')}</div>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              required
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button type="submit" className={styles.button}>
            {t('signUp')}
          </button>
        </form>

        <div className={styles.footerText}>
          {t('alreadyHaveAccount')}{' '}
          <Link href="/login" className={styles.link}>
            {t('logIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
