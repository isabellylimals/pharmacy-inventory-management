import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <StoreProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
