import { createRoot } from "react-dom/client";
import "./index.css";

console.log("Minimal test app starting...");

const TestApp = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Test App Working!</h1>
    <p>If you can see this, the basic setup works.</p>
  </div>
);

createRoot(document.getElementById("root")!).render(<TestApp />);
