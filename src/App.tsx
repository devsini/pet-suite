import { useEffect } from 'react';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { AppRoutes } from '@/router';

function App() {
  useEffect(() => {
    document.title = 'PetCare Suite';
  }, []);

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
