
import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    language: 'العربية',

    // General
    dashboard: 'Dashboard',
    myRides: 'My Rides',
    payments: 'Payments',
    account: 'Account',
    profile: 'Profile',
    settings: 'Settings',
    main: 'Main',
    loggedInAs: 'Logged in as',
    notLoggedIn: 'Not logged in',
    role: 'Role',
    rider: 'Rider',
    driver: 'Driver',

    // Home page
    demoBadge: 'Demo Uber-style booking',
    register: 'Register',
    login: 'Login',
    logout: 'Logout',
    bookRide: 'Book your next ride with',
    homeDescription: 'Enter your pickup and drop locations, preview your route on the map, then manage everything from your dashboard.',
    liveRoute: 'Live route preview',
    mapHint: 'After you request a ride, your pickup and drop markers will appear here.',
    whyUber: 'Why ride with Uber?',
    whyUberDescription: 'Upfront routes, simple booking flow, and a clean dashboard to track your trips.',
    safeReliable: 'Safe and reliable',
    safeDescription: 'Drivers verify their profile and see only rides that match their status.',
    ridersDrivers: 'For riders and drivers',
    ridersDriversDescription: 'Riders request trips in seconds, drivers see incoming requests on their dashboard.',
    realApp: 'Built like a real app',
    jwtAuth: 'JWT authentication with rider / driver roles',
    liveMap: 'Live map preview with pickup and drop markers',
    driverRequests: 'Driver dashboard with incoming ride requests',
    comingNext: 'Coming next',
    stripePayments: 'Stripe payments and fare history',
    driverAssignment: 'Better driver assignment logic',
    realtimeUpdates: 'Push-style real-time updates',
    driverHomeMessage: 'You are logged in as a driver. Go to your dashboard to see assigned rides.',
    riderLoginMessage: 'Please log in as a rider to request a ride.',
    greeting: 'Hi',

    // Login and registration
    welcomeBack: 'Welcome back',
    loginDescription: 'Log in to continue booking your rides.',
    email: 'Email',
    password: 'Password',
    enterEmail: 'you@example.com',
    logIn: 'Log in',
    newHere: 'New here?',
    createAccount: 'Create an account',
    createAccountTitle: 'Create account',
    registerDescription: 'Join as a rider or driver in seconds.',
    fullName: 'Full name',
    yourName: 'Your name',
    signUp: 'Sign up',
    alreadyHaveAccount: 'Already have an account?',
    registrationFailed: 'Registration failed',
    loginFailed: 'Login failed',
    serverError: 'Server error',

    // Driver and rider dashboards
    driverDashboard: 'Driver Dashboard',
    lostItemReports: 'Lost Item Reports',
    pickup: 'Pickup',
    dropoff: 'Dropoff',
    status: 'Status',
    acceptRide: 'Accept Ride',
    markCompleted: 'Mark Completed',
    reportLostItem: 'Report Lost Item',
    cancelRide: 'Cancel Ride',
    sendReply: 'Send Reply',
    found: 'Found',
    notFound: 'Not Found',
    waitingReply: 'Waiting for driver response...',
    noRides: 'No rides yet.',
    noRidesAvailable: 'No rides available.',
    noLostItems: 'No lost item reports.',
    lostItem: 'Lost Item',
    yourReply: 'Your Reply',
    writeReply: 'Write your reply...',
    loadingRides: 'Loading rides...',
    description: 'Description',
    driverReply: 'Driver Reply',
    replyRequired: 'Please write a reply first',
    replySent: 'Reply sent successfully',
    reportedSuccessfully: 'Lost item reported successfully!',
    reportFailed: 'Failed to report lost item',
    describeLostItem: 'Describe the lost item:',
    unknown: 'Unknown',

    // Ride statuses
    completed: 'Completed',
    requested: 'Requested',
    accepted: 'Accepted',
    cancelled: 'Cancelled',
    resolved: 'Resolved',
    underReview: 'Under Review',
    reported: 'Reported',
  },

  ar: {
    language: 'English',

    // General
    dashboard: 'لوحة التحكم',
    myRides: 'رحلاتي',
    payments: 'المدفوعات',
    account: 'الحساب',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    main: 'القائمة الرئيسية',
    loggedInAs: 'تم تسجيل الدخول بصفة',
    notLoggedIn: 'لم يتم تسجيل الدخول',
    role: 'الصفة',
    rider: 'راكب',
    driver: 'سائق',

    // Home page
    demoBadge: 'نموذج تجريبي لحجز الرحلات',
    register: 'إنشاء حساب',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    bookRide: 'احجز رحلتك القادمة مع',
    homeDescription: 'أدخل موقع الانطلاق والوجهة، وشاهد مسارك على الخريطة، ثم أدر رحلاتك من لوحة التحكم.',
    liveRoute: 'معاينة المسار مباشرة',
    mapHint: 'بعد طلب الرحلة ستظهر علامات موقع الانطلاق والوجهة هنا.',
    whyUber: 'لماذا تختار أوبر؟',
    whyUberDescription: 'مسارات واضحة، وخطوات حجز بسيطة، ولوحة تحكم لمتابعة رحلاتك.',
    safeReliable: 'آمن وموثوق',
    safeDescription: 'يتم التحقق من ملفات السائقين، ويشاهدون الرحلات المناسبة لحالتهم فقط.',
    ridersDrivers: 'للركاب والسائقين',
    ridersDriversDescription: 'يطلب الركاب رحلاتهم خلال ثوانٍ، ويشاهد السائقون الطلبات الواردة في لوحة التحكم.',
    realApp: 'مصمم ليعمل كتطبيق حقيقي',
    jwtAuth: 'تسجيل دخول آمن مع تحديد صلاحيات الراكب والسائق',
    liveMap: 'معاينة مباشرة للخريطة مع تحديد الانطلاق والوجهة',
    driverRequests: 'لوحة للسائق تعرض طلبات الرحلات الواردة',
    comingNext: 'ميزات قادمة',
    stripePayments: 'الدفع الإلكتروني وسجل الأجرة',
    driverAssignment: 'تحسين آلية توزيع السائقين',
    realtimeUpdates: 'تحديثات فورية ومباشرة',
    driverHomeMessage: 'أنت مسجل الدخول بصفة سائق. انتقل إلى لوحة التحكم لمشاهدة الرحلات المسندة إليك.',
    riderLoginMessage: 'يرجى تسجيل الدخول بصفة راكب لطلب رحلة.',
    greeting: 'مرحباً',

    // Login and registration
    welcomeBack: 'مرحباً بعودتك',
    loginDescription: 'سجل الدخول لمتابعة حجز رحلاتك.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    enterEmail: 'you@example.com',
    logIn: 'تسجيل الدخول',
    newHere: 'مستخدم جديد؟',
    createAccount: 'إنشاء حساب',
    createAccountTitle: 'إنشاء حساب جديد',
    registerDescription: 'انضم إلينا كراكب أو سائق خلال ثوانٍ.',
    fullName: 'الاسم الكامل',
    yourName: 'أدخل اسمك',
    signUp: 'إنشاء الحساب',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    registrationFailed: 'فشل إنشاء الحساب',
    loginFailed: 'فشل تسجيل الدخول',
    serverError: 'حدث خطأ في الاتصال بالخادم',

    // Driver and rider dashboards
    driverDashboard: 'لوحة السائق',
    lostItemReports: 'بلاغات المفقودات',
    pickup: 'موقع الانطلاق',
    dropoff: 'الوجهة',
    status: 'الحالة',
    acceptRide: 'قبول الرحلة',
    markCompleted: 'إكمال الرحلة',
    reportLostItem: 'الإبلاغ عن غرض مفقود',
    cancelRide: 'إلغاء الرحلة',
    sendReply: 'إرسال الرد',
    found: 'تم العثور عليه',
    notFound: 'لم يتم العثور عليه',
    waitingReply: 'بانتظار رد السائق...',
    noRides: 'لا توجد رحلات حتى الآن.',
    noRidesAvailable: 'لا توجد رحلات متاحة.',
    noLostItems: 'لا توجد بلاغات مفقودات.',
    lostItem: 'الغرض المفقود',
    yourReply: 'ردك',
    writeReply: 'اكتب ردك هنا...',
    loadingRides: 'جارٍ تحميل الرحلات...',
    description: 'الوصف',
    driverReply: 'رد السائق',
    replyRequired: 'يرجى كتابة الرد أولاً',
    replySent: 'تم إرسال الرد بنجاح',
    reportedSuccessfully: 'تم الإبلاغ عن الغرض بنجاح!',
    reportFailed: 'فشل إرسال البلاغ',
    describeLostItem: 'صف الغرض المفقود:',
    unknown: 'غير معروف',

    // Ride statuses
    completed: 'مكتملة',
    requested: 'قيد الانتظار',
    accepted: 'مقبولة',
    cancelled: 'ملغاة',
    resolved: 'تمت المعالجة',
    underReview: 'قيد المراجعة',
    reported: 'تم الإبلاغ',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('appLanguage');

    if (savedLanguage === 'ar' || savedLanguage === 'en') {
      setLanguage(savedLanguage);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

    localStorage.setItem('appLanguage', language);
  }, [language, isReady]);

  const toggleLanguage = () => {
    setLanguage((current) => current === 'en' ? 'ar' : 'en');
  };

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
