import React from "react";
import AdaptiveRouter from "./routes/AdaptiveRouter";
import { ConfirmProvider } from "./components/desktop/ConfirmDialog";

function App() {
  return (
    <ConfirmProvider>
      <AdaptiveRouter />
    </ConfirmProvider>
  );
}

export default App;
