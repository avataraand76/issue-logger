// src/pages/MaterialsPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button } from "@mui/material";

const MaterialsPage = () => {
  const [issue, setIssue] = useState("");
  const [resolution, setResolution] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ issue, resolution, responsiblePerson });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <TextField
          label="Vấn đề"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Resolution Method"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Responsible Person"
          value={responsiblePerson}
          onChange={(e) => setResponsiblePerson(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Next
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={handleBack}
        >
          Back
        </Button>
      </form>
    </Container>
  );
};

export default MaterialsPage;
