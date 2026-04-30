import React, { useEffect } from "react";
import AppRoutes from "./routes";
import { recordAppOpen } from "./utils/metrics";

function App() {
  useEffect(() => {
    recordAppOpen();
  }, []);

  return <AppRoutes />;
}

export default App;
