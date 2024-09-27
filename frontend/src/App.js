// src/App.js
import React from "react";
import AppRoutes from "./routes";
import { FormProvider } from "./context/FormContext";

const App = () => {
  return (
    <FormProvider>
      <AppRoutes />
    </FormProvider>
  );
};

export default App;
