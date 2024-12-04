// frontend/src/data/api.js
import { format } from "date-fns";

const API_URL = "http://localhost:8081/api";

export const fetchIssues = async () => {
  try {
    const response = await fetch(`${API_URL}/issues`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
};

export const addIssue = async (issueData) => {
  try {
    const getCategoryId = (scope) => {
      switch (scope) {
        case "MÁY MÓC":
          return 1;
        case "CON NGƯỜI":
          return 2;
        case "NGUYÊN PHỤ LIỆU":
          return 3;
        case "PHƯƠNG PHÁP":
          return 4;
        default:
          return null;
      }
    };

    const now = new Date();
    const submissionTime = format(now, "yyyy-MM-dd HH:mm:00");

    const response = await fetch(`${API_URL}/issues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submissionTime,
        lineNumber: issueData.lineNumber,
        stationNumber: issueData.stationNumber,
        id_category: getCategoryId(issueData.scope),
        responsiblePerson: issueData.responsiblePerson,
        oldProductCode: issueData.oldProductCode || null,
        newProductCode: issueData.newProductCode || null,
        workshop: issueData.workshop,
        factory: issueData.factory,
        status_logged_issue: "pending",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add issue");
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
    const requestData = {
      endTime,
      ...additionalData,
    };

    const response = await fetch(`${API_URL}/issues/${id}/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to end issue");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error ending issue:", error);
    throw error;
  }
};

export const fetchIssuesByCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_URL}/issues-by-category/${categoryId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching issues by category:", error);
    throw error;
  }
};

export const fetchSolutionsByCategory = async (categoryId) => {
  try {
    const response = await fetch(
      `${API_URL}/solutions-by-category/${categoryId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching solutions by category:", error);
    throw error;
  }
};

export const fetchMachineryCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/machinery-categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching machinery categories:", error);
    throw error;
  }
};

export const fetchMachineryByCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_URL}/machinery/${categoryId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching machinery:", error);
    throw error;
  }
};

export const fetchEmployees = async (workshopId, lineNumber) => {
  try {
    const response = await fetch(
      `${API_URL}/employees/${workshopId}?lineNumber=${encodeURIComponent(
        lineNumber
      )}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};
