// store.js
const fs = require('fs');
const path = require('path');

// Load default patterns
const defaultPatterns = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'default-patterns.json'), 'utf8')
).sensitivePatterns;

// Initialize store with separate arrays for default and custom patterns
const store = {
  defaultPatterns: [...defaultPatterns],
  customPatterns: [],

  addPattern: function(pattern) {
    this.customPatterns.push(pattern);
  },

  deletePattern: function(index) {
    if (index >= 0 && index < this.customPatterns.length) {
      this.customPatterns.splice(index, 1);
    } else {
      throw new Error("Pattern not found");
    }
  },

  getCustomPatterns: function() {
    return this.customPatterns;
  },

  // For scanning, we use both default and custom patterns
  getAllPatterns: function() {
    return [...this.defaultPatterns, ...this.customPatterns];
  }
};

module.exports = store;