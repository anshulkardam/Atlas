import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster richColors theme="dark" />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
