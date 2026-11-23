
import UserProfile from '../components/UserProfile';

export default function ProfilePage() {
  return (
    <UserProfile
      user={{
        name: 'Ali',
        email: 'aa@gmail.com',
        role: 'rider',
      }}
      activeTab="profile"
      onTabChange={(tab) => console.log('Active tab:', tab)}
    />
  );
}
