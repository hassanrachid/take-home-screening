var express = require('express');
const axios = require('axios');
var router = express.Router();

router.get('/:formId/filteredResponses', async (req, res) => {
  try {
    const formId = req.params.formId;
    const apiKey = 'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912';

    // get filters from req
    const filters = req.query.filters ? JSON.parse(req.query.filters) : [];

    // call fillout api
    const response = await axios.get(`https://api.fillout.com/v1/api/forms/${formId}/submissions`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const filteredResponses = response.data.responses.filter(response => {
      for (const filter of filters) {
        const question = response.questions.find(question => question.id === filter.id);
        const value = question ? question.value : null;
    
        switch (filter.condition) {
          case 'equals':
            if (value !== filter.value) return false;
            break;
          case 'does_not_equal':
            if (value === filter.value) return false;
            break;
          case 'greater_than':
            if (value <= filter.value) return false;
            break;
          case 'less_than':
            if (value >= filter.value) return false;
            break;
          default:
            return false;
        }
      }
    
      return true;
    });

    const result = {
      responses: filteredResponses,
      totalResponses: filteredResponses.length,
      pageCount: 1
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
