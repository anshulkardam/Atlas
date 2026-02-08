import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import Index from "./pages/Index";
import Signup from "./pages/RegisterPage";
import Login from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import { useBootstrapAuth } from "./hooks/bootstrapAuth";
import ProtectedRoute from "./routes/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  useBootstrapAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors theme="dark" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />

          {/* 🔒 Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
