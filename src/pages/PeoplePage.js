import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button } from "@mui/material";

const PeoplePage = () => {
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
          label="Hành động khắc phục"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Người chịu trách nhiệm"
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

export default PeoplePage;
