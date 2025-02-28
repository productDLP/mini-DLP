// controllers/patternController.js
const store = require('../store');

exports.getPatterns = (req, res) => {
    try {
        const patterns = store.getCustomPatterns();
        res.json(patterns);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching patterns' });
    }
};

exports.addPattern = (req, res) => {
    const { name, pattern } = req.body;
    if (!name || !pattern) {
        return res.status(400).json({ error: 'Name and pattern are required' });
    }
    try {
        new RegExp(pattern);
        store.addPattern({ name, pattern });
        res.json({ message: 'Pattern added successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Invalid regex pattern' });
    }
};

exports.deletePattern = (req, res) => {
    const index = parseInt(req.params.index);
    try {
        store.deletePattern(index);
        res.json({ message: 'Pattern deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting pattern' });
    }
};