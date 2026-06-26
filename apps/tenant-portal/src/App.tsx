import React from "react";
import AdaptiveRouter from "./routes/AdaptiveRouter";
import { ConfirmProvider } from "./components/desktop/ConfirmDialog";
import { AlertProvider } from "./components/desktop/AlertDialog";

function App() {
  return (
    <AlertProvider>
      <ConfirmProvider>
        <AdaptiveRouter />
      </ConfirmProvider>
    </AlertProvider>
  );
}

export default App;
