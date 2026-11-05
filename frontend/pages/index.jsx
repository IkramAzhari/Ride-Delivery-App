
import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import RideForm from '../components/RideForm';
import styles from '../components/HomeHero.module.css';
import Footer from '../components/Footer';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
});

export default function Home() {
  const { user, logout, token } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);

  const handleRequestRide = async ({ pickup, dropoff }) => {
    setPickup([17.385, 78.4867]);
    setDropoff([17.435, 78.4444]);

    if (!token) {
      alert(t('riderLoginMessage'));
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pickup, dropoff }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(language === 'ar' ? 'تم طلب الرحلة بنجاح!' : 'Ride requested successfully!');
        console.log('Ride created:', data);
      } else {
        console.error('Ride error:', data);
        alert(data.error || (language === 'ar' ? 'فشل طلب الرحلة' : 'Ride request failed'));
      }
    } catch (err) {
      console.error('Ride request error:', err);
      alert(t('serverError'));
    }
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.topBar}>
            <div className={styles.logo}>
              Uber<span>Clone</span>
            </div>

            <nav className={styles.navLinks}>
              <button
                type="button"
                onClick={toggleLanguage}
                className={styles.navLink}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  background: '#fff',
                  color: '#092032',
                  fontWeight: 'bold',
                }}
              >
                {language === 'en' ? 'العربية' : 'English'}
              </button>

              {user ? (
                <>
                  <span className={styles.navLink}>
                    {user.name
                      ? `${t('greeting')}, ${user.name}`
                      : user.email}
                  </span>

                  <Link href="/dashboard" className={styles.navLink}>
                    {t('dashboard')}
                  </Link>

                  <button
                    type="button"
                    className={styles.navLink}
                    onClick={logout}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/register" className={styles.navLink}>
                    {t('register')}
                  </Link>

                  <Link href="/login" className={styles.navLink}>
                    {t('login')}
                  </Link>

                  <Link href="/dashboard" className={styles.navLink}>
                    {t('dashboard')}
                  </Link>
                </>
              )}
            </nav>
          </header>

          <div className={styles.badge}>
            {t('demoBadge')}
          </div>

          <div className={styles.heroGrid}>
            <section className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                {t('bookRide')}{' '}
                <span className={styles.heroHighlight}>Uber</span>
              </h1>

              <p className={styles.heroSubtitle}>
                {t('homeDescription')}
              </p>

              <div className={styles.formCard}>
                {user && user.role === 'driver' ? (
                  <p className={styles.helperText}>
                    {t('driverHomeMessage')}
                  </p>
                ) : user ? (
                  <RideForm onRequestRide={handleRequestRide} />
                ) : (
                  <p className={styles.helperText}>
                    {t('riderLoginMessage')}
                  </p>
                )}
              </div>
            </section>

            <section className={styles.mapCard}>
              <div className={styles.mapHeader}>
                <div className={styles.mapTitle}>
                  {t('liveRoute')}
                </div>

                <div className={styles.mapHint}>
                  {t('mapHint')}
                </div>
              </div>

              <div className={styles.mapBody}>
                <MapComponent pickup={pickup} dropoff={dropoff} />
              </div>
            </section>
          </div>

          <section className={styles.infoSection}>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <h2>{t('whyUber')}</h2>
                <p>{t('whyUberDescription')}</p>
              </div>

              <div className={styles.infoCard}>
                <h3>{t('safeReliable')}</h3>
                <p>{t('safeDescription')}</p>
              </div>

              <div className={styles.infoCard}>
                <h3>{t('ridersDrivers')}</h3>
                <p>{t('ridersDriversDescription')}</p>
              </div>
            </div>
          </section>

          <section className={styles.infoSectionAlt}>
            <div className={styles.infoSplit}>
              <div>
                <h2>{t('realApp')}</h2>
                <ul>
                  <li>{t('jwtAuth')}</li>
                  <li>{t('liveMap')}</li>
                  <li>{t('driverRequests')}</li>
                </ul>
              </div>

              <div>
                <h2>{t('comingNext')}</h2>
                <ul>
                  <li>{t('stripePayments')}</li>
                  <li>{t('driverAssignment')}</li>
                  <li>{t('realtimeUpdates')}</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}
