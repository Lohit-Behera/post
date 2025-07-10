import { ThemeProvider } from "@/components/theme-provider";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Layout from "@/Layout";
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import ProtectedRoute from "@/components/ProtectedRoute";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AuthPageWithGoogleProvider = () => (
  <GoogleOAuthProvider clientId={clientId}>
    <AuthPage />
  </GoogleOAuthProvider>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="/auth" element={<AuthPageWithGoogleProvider />} />
    </Route>
  )
);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router}></RouterProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}

export default App;
