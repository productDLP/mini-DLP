const form = document.getElementById('dlpForm');
const responseBox = document.getElementById('responseBox');
const fileInput = document.getElementById('fileInput');
const textInput = document.getElementById('data');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Check if a file is uploaded
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async function(event) {
      const fileData = event.target.result;
      await processData(fileData); // Process file content
    };
    reader.readAsText(file);
  } else if (textInput.value.trim() !== "") {
    // Process text field content if no file is uploaded
    await processData(textInput.value);
  } else {
    // Show error if both inputs are empty
    responseBox.style.display = 'block';
    responseBox.textContent = '❌ Please provide data through text or file.';
    responseBox.classList.add('error');
    responseBox.classList.remove('success');
  }
});

async function processData(data) {
  try {
    // Simulate DLP checks for sensitive data
    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/.test(data)) {
      throw new Error('❌ Email addresses are not allowed!');
    }
    if (/\b(?:\d[ -]*?){13,16}\b/.test(data)) {
      throw new Error('❌ Credit card numbers are not allowed!');
    }

    // Simulate API call
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: data })
    });

    const result = await response.json();

    // Display response from mock API
    responseBox.style.display = 'block';
    if (result.id) {
      responseBox.textContent = `✅ API Response: Data received (ID: ${result.id})`;
      responseBox.classList.remove('error');
      responseBox.classList.add('success');
    }
  } catch (error) {
    // Display error message
    responseBox.style.display = 'block';
    responseBox.textContent = error.message;
    responseBox.classList.add('error');
    responseBox.classList.remove('success');
  }
}
