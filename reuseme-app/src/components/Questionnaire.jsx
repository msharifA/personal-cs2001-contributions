import React, { useState } from "react";
import axios from "axios";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography
} from '@mui/material';

const questions = [
  { id: "clothes", text: "How many second-hand clothes have you bought or acquired through donations?" },
  { id: "electricals", text: "How many second-hand electricals have you bought or acquired through donations?" },
  { id: "books", text: "How many second-hand books have you bought or acquired through donations?" },
  { id: "smallFurniture", text: "How many small furniture items have you bought or acquired through donations?" },
  { id: "largeFurniture", text: "How many large furniture items have you bought or acquired through donations?" },
  { id: "toys", text: "How many toys have you bought or acquired through donations?" },
];

const Questionnaire = ({ closeModal, onSubmitSuccess, userId }) => {
  const [formData, setFormData] = useState({
    clothes: 0,
    electricals: 0,
    books: 0,
    smallFurniture: 0,
    largeFurniture: 0,
    toys: 0,
  });

  const [step, setStep] = useState(0);
  const [openInfoDialog, setOpenInfoDialog] = useState(false);

  const handleInputChange = (value) => {
    const numericValue = Math.max(0, Number(value));
    setFormData((prev) => ({ ...prev, [questions[step].id]: numericValue }));
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, questions.length - 1));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Debugging: Log the formData and userId
    console.log("Submitting form data:", formData);
    console.log("User ID:", userId);

    // Validate userId
    if (!userId) {
      alert("User ID is missing. Please try again.");
      return;
    }

    axios.post(`http://localhost:8080/api/questionnaire/${userId}`, formData)
      .then((response) => {
        console.log("Response from server:", response.data);
        onSubmitSuccess(response.data.co2Savings);
        closeModal();
      })
      .catch((error) => {
        console.error("Error saving data!", error);
        if (error.response && error.response.data) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          alert("Failed to save data. Please try again.");
        }
      });
  };

  return (
    <form onSubmit={handleSubmit} className="questionnaire">
      <h2 className="text-2xl font-semibold text-center mb-6">Your Sustainability Impact</h2>
      <div key={step}>
        <Typography variant="h6" className="mb-4 font-medium">
          {step + 1}. {questions[step].text}
        </Typography>
        <input
          type="number"
          className="w-full p-2 border rounded-lg text-lg"
          value={formData[questions[step].id] || ""}
          onChange={(e) => handleInputChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col mt-6">
        {step < questions.length - 1 ? (
          <Button onClick={handleNext} variant="contained" color="primary" sx={{ mb: 2 }}>
            Next
          </Button>
        ) : (
          <Button type="submit" variant="contained" color="success" sx={{ mb: 2 }}>
            Submit
          </Button>
        )}
        <Button onClick={handlePrev} disabled={step === 0} variant="outlined" color="secondary" sx={{ backgroundColor: '#f0f0f0' }}>
          Back
        </Button>
      </div>
      
      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => setOpenInfoDialog(true)}
      >
        How do we calculate your saved emissions?
      </Button>

      <Dialog open={openInfoDialog} onClose={() => setOpenInfoDialog(false)}>
        <DialogTitle className="text-xl font-semibold">How do we calculate your saved emissions?</DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Here is how we calculate the CO2 savings for each item:
          </Typography>
          <Typography variant="body2" gutterBottom>
            - **Clothes**: 5 kg CO2 saved per item.
          </Typography>
          <Typography variant="body2" gutterBottom>
            - **Electricals**: 50 kg CO2 saved per item.
          </Typography>
          <Typography variant="body2" gutterBottom>
            - **Books**: 2 kg CO2 saved per item.
          </Typography>
          <Typography variant="body2" gutterBottom>
            - **Small Furniture**: 70 kg CO2 saved per item.
          </Typography>
          <Typography variant="body2" gutterBottom>
            - **Large Furniture**: 250 kg CO2 saved per item.
          </Typography>
          <Typography variant="body2" gutterBottom>
            - **Toys**: 1.5 kg CO2 saved per item.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInfoDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default Questionnaire;