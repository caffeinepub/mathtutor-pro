import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  );
}
