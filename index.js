require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/fetch-ai-data', async (req, res) => {
    const { email } = req.body;

    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: `Email: ${email}\nFirst Name:\nLast Name:\nCompany Name:\nDomain of Expertise:\nJob Role:\n`,
            max_tokens: 50,
            n: 1,
            stop: ['\n'],
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        const data = response.data.choices[0].text.split('\n');
        res.json({
            firstName: data[1].split(':')[1].trim(),
            lastName: data[2].split(':')[1].trim(),
            companyName: data[3].split(':')[1].trim(),
            domainExpertise: data[4].split(':')[1].trim(),
            jobRole: data[5].split(':')[1].trim(),
        });

    } catch (error) {
        console.error('Error fetching data from OpenAI:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/submit', async (req, res) => {
    const jsonData = req.body;

    try {
        await axios.post('https://api.pipedrive.com/v1/persons?api_token=' + process.env.PIPEDRIVE_API_KEY, jsonData, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        res.send('Form submitted successfully!');
    } catch (error) {
        console.error('Error submitting data to Pipedrive:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});