// src/data/api.js

const API_URL =
  "https://script.google.com/macros/s/AKfycbyWe4-43d2-NYhWHOARubzefrzWDRn_3bg8I_V3n7kP13WyP1coUEhP8Hy0HMyEae24eg/exec"; // deploy lại app script thì đổi đây

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

export const endIssue = async (id, endTime) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "endIssue",
        id,
        endTime,
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
