import { AuthProvider } from '../context/AuthContext';
import { RideProvider } from '../context/RideContext';
import { LanguageProvider } from '../context/LanguageContext';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </LanguageProvider>
  );
}