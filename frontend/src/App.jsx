import { useEffect, useState } from "react";
import SetupWizard from "./setup/SetupWizard.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LogMeeting from "./pages/LogMeeting.jsx";
import ReviewMeeting from "./pages/ReviewMeeting.jsx";
import Clients from "./pages/Clients.jsx";
import ClientDetail from "./pages/ClientDetail.jsx";
import Pipeline from "./pages/Pipeline.jsx";
import Settings from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";
import FollowUps from "./pages/FollowUps.jsx";
import { AuthProvider, useAuth } from "./hooks/useAuth";

function AppContent() {
  const [setupDone, setSetupDone] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [pageData, setPageData] = useState({});
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    fetch("/api/setup/status")
      .then(r => r.json())
      .then(d => setSetupDone(d.setup_done))
      .catch(() => setSetupDone(false));
  }, []);

  const navigate = (p, data = {}) => {
    setPage(p);
    setPageData(data);
  };

  if (setupDone === null || authLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: "'Poppins', sans-serif", color: "#64748b"
      }}>
        Loading SalesSathi…
      </div>
    );
  }

  if (!setupDone) {
    return <SetupWizard onComplete={() => { setSetupDone(true); navigate("dashboard"); }} />;
  }

  // Protected Route Check
  if (page === "settings" && !user) {
    setPage("login");
    setPageData({ from: "settings" });
  }

  const screen = (() => {
    switch (page) {
      case "login": return <Login navigate={navigate} data={pageData} />;
      case "log-meeting": return <LogMeeting navigate={navigate} />;
      case "review-meeting": return <ReviewMeeting data={pageData} navigate={navigate} />;
      case "clients": return <Clients navigate={navigate} />;
      case "followups": return <FollowUps navigate={navigate} />;
      case "client-detail": return <ClientDetail clientId={pageData.clientId} navigate={navigate} />;
      case "pipeline": return <Pipeline navigate={navigate} />;
      case "settings": return <Settings />;
      default: return <Dashboard navigate={navigate} />;
    }
  })();

  return (
    <Layout page={page} navigate={navigate}>
      {screen}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
