// src/data/api.js

const API_URL =
  "https://script.google.com/macros/s/AKfycbyr1yJQlfm7VuRKGa1Iqmp1FKCo6uPGrPAOiJx7B-khgL-Z5NPRcFuqY66iuzTZ5eldYw/exec"; // deploy lại app script thì đổi đây version 29 15/08/2024

export const fetchIssues = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Data is not in expected format");
    }
    return data;
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
};

export const addIssue = async (issueData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addIssue",
        ...issueData,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to add issue");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error adding issue:", error);
    throw error;
  }
};

export const endIssue = async (id, endTime, additionalData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "endIssue",
        id,
        endTime,
        ...additionalData,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to end issue");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error ending issue:", error);
    throw error;
  }
};
