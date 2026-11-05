
import styles from './DashboardLayout.module.css';
import { useLanguage } from '../context/LanguageContext';

export default function DashboardLayout({ user, left, right }) {
  const { t } = useLanguage();

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.dashboardShell}>
        <aside className={styles.sidebar}>
          <div className={styles.logo}>
            Uber<span>Clone</span>
          </div>

          <div className={styles.navTitle}>
            {t('main')}
          </div>

          <ul className={styles.navList}>
            <li className={`${styles.navItem} ${styles.navItemActive}`}>
              {t('dashboard')}
            </li>
            <li className={styles.navItem}>
              {t('myRides')}
            </li>
            <li className={styles.navItem}>
              {t('payments')}
            </li>
          </ul>

          <div
            className={styles.navTitle}
            style={{ marginTop: '18px' }}
          >
            {t('account')}
          </div>

          <ul className={styles.navList}>
            <li className={styles.navItem}>
              {t('profile')}
            </li>
            <li className={styles.navItem}>
              {t('settings')}
            </li>
          </ul>
        </aside>

        <main className={styles.main}>
          <div className={styles.topRow}>
            <h1 className={styles.pageTitle}>
              {t('dashboard')}
            </h1>

            <div className={styles.userChip}>
              {user
                ? `${t('loggedInAs')} ${t(user.role)}`
                : t('notLoggedIn')}
            </div>
          </div>

          <div className={styles.contentCards}>
            <section className={styles.card}>
              {left}
            </section>

            <section className={styles.card}>
              {right}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
