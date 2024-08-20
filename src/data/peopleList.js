// src/data/peopleList.js

async function getPeopleList() {
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxnjK1Ut-8rZXVd_xSqpRdABwwKpqXoNQYhEnspu5ZU87rzE7PsA54w0x5jjKVyWYm0jg/exec";

  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem fetching the data:", error);
    return {};
  }
}

export default getPeopleList;
