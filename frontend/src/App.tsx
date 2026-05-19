import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAgentStore } from "@/store/agentStore";
import { getAgent, getToken } from "@/utils/helpers";
import AppLayout from "@/components/common/AppLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ActiveCall = lazy(() => import("./pages/ActiveCall"));
const CallHistory = lazy(() => import("./pages/CallHistory"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => {
  const setAgent = useAgentStore((s) => s.setAgent);

  useEffect(() => {
    const agent = getAgent();
    if (agent) setAgent(agent);
  }, [setAgent]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "13px",
            borderRadius: "12px",
            border: "1px solid hsl(220 13% 91%)",
            boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
          },
        }}
      />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/call/:callId" element={<ActiveCall />} />
              <Route path="/history" element={<CallHistory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
};

export default App;
