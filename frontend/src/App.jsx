import { useEffect, useState } from "react";
import SetupWizard    from "./setup/SetupWizard.jsx";
import Layout         from "./components/Layout.jsx";
import Dashboard      from "./pages/Dashboard.jsx";
import LogMeeting     from "./pages/LogMeeting.jsx";
import ReviewMeeting  from "./pages/ReviewMeeting.jsx";
import Clients        from "./pages/Clients.jsx";
import ClientDetail   from "./pages/ClientDetail.jsx";
import Pipeline       from "./pages/Pipeline.jsx";
import Settings       from "./pages/Settings.jsx";

export default function App() {
  const [setupDone, setSetupDone] = useState(null);
  const [page,      setPage]      = useState("dashboard");
  const [pageData,  setPageData]  = useState({});

  useEffect(() => {
    fetch("/api/setup/status")
      .then(r => r.json())
      .then(d => setSetupDone(d.setup_done))
      .catch(() => setSetupDone(false));
  }, []);

  const navigate = (p, data = {}) => { setPage(p); setPageData(data); };

  if (setupDone === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: "'Inter', sans-serif", color: "#64748b" }}>
        Loading SalesSaathi…
      </div>
    );
  }

  if (!setupDone) {
    return <SetupWizard onComplete={() => { setSetupDone(true); navigate("dashboard"); }} />;
  }

  const screen = (() => {
    switch (page) {
      case "log-meeting":    return <LogMeeting navigate={navigate} />;
      case "review-meeting": return <ReviewMeeting data={pageData} navigate={navigate} />;
      case "clients":        return <Clients navigate={navigate} />;
      case "client-detail":  return <ClientDetail clientId={pageData.clientId} navigate={navigate} />;
      case "pipeline":       return <Pipeline navigate={navigate} />;
      case "settings":       return <Settings />;
      default:               return <Dashboard navigate={navigate} />;
    }
  })();

  return (
    <Layout page={page} navigate={navigate}>
      {screen}
    </Layout>
  );
}
