// frontend/src/context/FormContext.js
import React, { createContext, useState, useContext, useCallback } from "react";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    lineNumber: "",
    scope: "",
    machineryType: "",
    code: "",
    issue: "",
    otherIssue: "",
    remediation: "",
    otherRemediation: "",
    responsiblePerson: "",
  });

  const updateFormData = useCallback((newData) => {
    setFormData((prevData) => ({ ...prevData, ...newData }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData({
      lineNumber: "",
      scope: "",
      machineryType: "",
      code: "",
      issue: "",
      otherIssue: "",
      remediation: "",
      otherRemediation: "",
      responsiblePerson: "",
    });
  }, []);

  return (
    <FormContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => useContext(FormContext);
