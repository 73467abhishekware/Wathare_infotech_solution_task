const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Replace with your MongoDB connection string
const mongoURI = "mongodb://localhost:27017/abhishek";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const SampleData = mongoose.model('sampledata', new mongoose.Schema({
    ts: { type: String, required: true }, // Update field name to "ts"
    machine_status: { type: Number, required: true }, // Assuming "machine_status" is the actual field name
    vibration: { type: Number, required: true } // Assuming "vibration" is the actual field name
}));

app.use(cors());
app.use(bodyParser.json());

// Get data with optional filtering
app.get('/data', async (req, res) => {
    const startTime = req.query.start_time ? new Date(req.query.start_time) : null;
    const endTime = req.query.end_time ? new Date(req.query.end_time) : null;

    let query = {};
    if (startTime && endTime) {
        query.ts = { $gte: startTime.toISOString(), $lte: endTime.toISOString() };
    }

    try {
        const data = await SampleData.find(query);
        const summary = calculateSummary(data); // Function to calculate summary statistics
        res.json({ data, summary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

// Get all data
app.get('/alldata', async (req, res) => {
    try {
        const allData = await SampleData.find();
        res.json(allData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching all data' });
    }
});

function calculateSummary(data) {
    const numOnes = data.filter(d => d.sample === 1).length;
    const numZeros = data.length - numOnes;
    // Implement logic to calculate continuous stretches (optional)
    return { numOnes, numZeros }; // Add continuous stretches data if implemented
}

app.listen(port, () => console.log(`Server running on port ${port}`));
