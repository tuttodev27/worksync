import { Outlet } from "react-router-dom";
import RecluiterSidebar from "./RecluiterSidebar";
import "./RecluiterLayout.css";

export default function RecluiterLayout() {
  return (
    <div className="recluiter-shell">
      <RecluiterSidebar />
      <div className="recluiter-main">
        <main className="recluiter-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
