import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Handle redirect from 404.html
const redirect = sessionStorage.getItem('redirect');
if (redirect && redirect !== '/') {
  sessionStorage.removeItem('redirect');
  window.history.replaceState(null, '', redirect);
}

console.log("App starting...");

createRoot(document.getElementById("root")!).render(<App />);
