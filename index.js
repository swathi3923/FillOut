const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const API_KEY = `sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912` ;

app.use(express.json());

app.get('/:formId/responses', async (req, res) => {
  try {
      
    const { formId } = req.params;
    const { filters } = req.query;

    const parsedFilters = JSON.parse(filters);

    const apiKey = API_KEY;
    
    const headers = {
      Authorization: `Bearer ${apiKey}`
    };

    const apiUrl = `http://api.fillout.com/v1/api/forms/${formId}/submissions`;
    const response = await axios.get(apiUrl, { headers });

    const filteredResponses = response.data.responses.filter(response => {
      return parsedFilters.every(filter => {
        const question = response.questions.find(q => q.id === filter.id);

        if (!question) return false;

        switch (filter.condition) {
          case 'equals':
            return question.value === filter.value;
          case 'does_not_equal':
            return question.value !== filter.value;
          case 'greater_than':
            return question.value > filter.value;
          case 'less_than':
            return question.value < filter.value;
          default:
            return false;
        }
      });
    });

    response.data.totalResponses = filteredResponses.length;
    response.data.responses = filteredResponses;

    if (response.data.totalResponses === 0) {
      res.status(404).json({ error: 'No matching responses found' });
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
