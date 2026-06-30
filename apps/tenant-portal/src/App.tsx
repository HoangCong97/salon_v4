import React from "react";
import AdaptiveRouter from "./routes/AdaptiveRouter";
import { ConfirmProvider } from "./components/desktop/ConfirmDialog";
import { AlertProvider } from "./components/desktop/AlertDialog";
import { ToastProvider } from "./components/desktop/ToastProvider";

function App() {
  return (
    <ToastProvider>
      <AlertProvider>
        <ConfirmProvider>
          <AdaptiveRouter />
        </ConfirmProvider>
      </AlertProvider>
    </ToastProvider>
  );
}

export default App;
