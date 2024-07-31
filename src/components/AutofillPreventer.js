// src/components/AutofillPreventer.js
import { useEffect } from "react";

const AutofillPreventer = () => {
  useEffect(() => {
    // Tạo các trường ẩn
    const form = document.querySelector("form");
    if (form) {
      const hiddenInputs = document.createElement("div");
      hiddenInputs.style.display = "none";
      hiddenInputs.innerHTML = `
        <input type="text" name="prevent_autofill" />
        <input type="password" name="password_fake" />
      `;
      form.prepend(hiddenInputs);
    }

    // Xóa giá trị autofill
    const clearAutofill = () => {
      const inputs = document.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        input.value = "";
      });
    };

    // Thực hiện xóa autofill sau khi component được render
    clearAutofill();

    // Thêm event listener để xóa autofill khi form được submit
    if (form) {
      form.addEventListener("submit", clearAutofill);
    }

    // Cleanup function
    return () => {
      if (form) {
        form.removeEventListener("submit", clearAutofill);
      }
    };
  }, []);

  return null; // Component này không render gì cả
};

export default AutofillPreventer;
