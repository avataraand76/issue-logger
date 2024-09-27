// frontend/src/data/api.js

const API_URL = "http://localhost:8081"; // Thay đổi URL này thành địa chỉ của server backend của bạn

export const fetchIssues = async () => {
  try {
    const response = await fetch(`${API_URL}/issues`);
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
  console.log("23", issueData);
  try {
    const response = await fetch(`${API_URL}/issues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(issueData),
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
    const response = await fetch(`${API_URL}/issues/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
