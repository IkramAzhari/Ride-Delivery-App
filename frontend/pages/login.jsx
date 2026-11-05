
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import styles from '../components/AuthForm.module.css';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.token && data.user) {
        login({ token: data.token, user: data.user });
        router.push('/');
      } else {
        setError(data.error || t('loginFailed'));
      }
    } catch {
      setError(t('serverError'));
    }
  };

  return (
    <div className={styles.authPage} dir="auto">
      <div className={styles.authCard}>
        <h1 className={styles.title}>{t('welcomeBack')}</h1>

        <p className={styles.subtitle}>
          {t('loginDescription')}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
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
            {t('logIn')}
          </button>
        </form>

        <div className={styles.footerText}>
          {t('newHere')}{' '}
          <Link href="/register" className={styles.link}>
            {t('createAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
}
