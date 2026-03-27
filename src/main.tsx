import { createRoot } from "react-dom/client";
import App from "./App-simple.tsx";
import "./index.css";

console.log("Loops Day Planner starting (simple version)...");

createRoot(document.getElementById("root")!).render(<App />);
