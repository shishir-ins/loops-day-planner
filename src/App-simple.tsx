import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

// Simple test components
const Index = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>🌿 Loops Day Planner</h1>
    <p>User page working!</p>
    <p>Passcode: iloveyou</p>
  </div>
);

const Admin = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>🛡️ Admin Panel</h1>
    <p>Admin page working!</p>
    <p>Passcode: loopsadmin</p>
  </div>
);

const Planner = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>📅 Daily Planner</h1>
    <p>Planner page working!</p>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/planner" element={<Planner />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
