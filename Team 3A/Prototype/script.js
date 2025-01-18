const content = {
  dashboard: `
    <h2>Dashboard Overview</h2>
    <p>Monitor flagged data, activity trends, and system performance.</p>
    <ul id="dashboardStats">
      <li>Files Analyzed: <strong>Loading...</strong></li>
      <li>Flagged Incidents: <strong>Loading...</strong></li>
      <li>Real-Time Alerts: <strong>Loading...</strong></li>
    </ul>
  `,
  upload: `
    <h2>File Upload</h2>
    <p>Upload a file or paste text to check for sensitive data like emails, credit card numbers, or SSNs.</p>
    <form id="uploadForm">
      <label for="fileInput">Select File:</label>
      <input type="file" id="fileInput" />
      <label for="textInput">Enter Text:</label>
      <textarea id="textInput" rows="4" placeholder="Type or paste your text here..."></textarea>
      <button type="submit">Upload</button>
    </form>
    <div id="uploadResult"></div>
  `,
  monitoring: `
    <h2>Real-Time Monitoring</h2>
    <p>Track sensitive data in real-time based on active settings.</p>
    <ul id="monitoringStats">
      <li>Files Monitored: <strong>Loading...</strong></li>
      <li>Active Alerts: <strong>Loading...</strong></li>
    </ul>
    <div id="monitorResults"></div>
  `,
  settings: `
    <h2>Settings</h2>
    <form id="settingsForm">
      <label for="flagTypes">Select Data to Monitor:</label>
      <select id="flagTypes" multiple>
        <option>Email Addresses</option>
        <option>Credit Card Numbers</option>
        <option>Social Security Numbers</option>
      </select>
      <button type="submit">Save Settings</button>
    </form>
    <p id="settingsStatus"></p>
  `,
  reports: `
    <h2>Reports</h2>
    <p>Select the type of data you want to download:</p>
    <form id="reportForm">
      <label for="dataType">Select Data Type:</label>
      <select id="dataType">
        <option value="emails">Emails</option>
        <option value="creditCards">Credit Cards</option>
        <option value="ssn">Social Security Numbers</option>
      </select>
      <button type="submit">Download Report</button>
    </form>
    <div id="reportStatus"></div>
  `,
};

// Simulated API endpoints
const api = {
  analyze: "https://jsonplaceholder.typicode.com/posts",
  monitoring: "https://jsonplaceholder.typicode.com/comments",
  reports: "https://jsonplaceholder.typicode.com/albums", // API endpoint for reports
};

// Dynamic content loader
document.querySelectorAll(".sidebar ul li a").forEach((link) => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const section = e.target.id.replace("Link", "");
    document.getElementById("mainContent").innerHTML =
      content[section] || "<p>Content not found.</p>";
    if (section === "dashboard") loadDashboard();
    if (section === "monitoring") loadMonitoring();
    if (section === "upload") setupUpload();
    if (section === "settings") setupSettings();
    if (section === "reports") setupReports();
  });
});

// Dashboard statistics loader
async function loadDashboard() {
  const stats = await fetch(api.monitoring).then((res) => res.json());
  document.getElementById("dashboardStats").innerHTML = `
    <li>Files Analyzed: <strong>${stats.length}</strong></li>
    <li>Flagged Incidents: <strong>${stats.length / 10}</strong></li>
    <li>Real-Time Alerts: <strong>${Math.floor(stats.length / 20)}</strong></li>
  `;
}

// Real-time monitoring loader
async function loadMonitoring() {
  const stats = await fetch(api.monitoring).then((res) => res.json());
  document.getElementById("monitoringStats").innerHTML = `
    <li>Files Monitored: <strong>${stats.length}</strong></li>
    <li>Active Alerts: <strong>${Math.floor(stats.length / 15)}</strong></li>
  `;
  document.getElementById("monitorResults").innerHTML = `<p>Monitoring stats updated.</p>`;
}

// Upload functionality
function setupUpload() {
  const form = document.getElementById("uploadForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // File input and text input
    const fileInput = document.getElementById("fileInput");
    const textInput = document.getElementById("textInput").value;
    let fileContent = "";

    // Read file if uploaded
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      fileContent = await file.text();
    }

    // Combine text input and file content
    const combinedContent = fileContent + textInput;

    // Check for sensitive information
    const sensitiveDataFound = checkForSensitiveData(combinedContent);

    // Display results
    const resultDiv = document.getElementById("uploadResult");
    if (sensitiveDataFound.length > 0) {
      resultDiv.innerHTML = `
        <p><strong>Sensitive Data Detected.</strong></p>
        <ul>
          ${sensitiveDataFound.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      `;
    } else {
      resultDiv.innerHTML = "<p>No sensitive data detected.Uploaded Sucessfully!</p>";
    }
  });
}

// Function to check for sensitive information
function checkForSensitiveData(content) {
  const patterns = {
    "Email Address": /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    "Credit Card Number": /\b(?:\d[ -]*?){13,16}\b/g,
    "Social Security Number (SSN)": /\b\d{3}-\d{2}-\d{4}\b/g,
  };

  const found = [];

  for (const [label, regex] of Object.entries(patterns)) {
    if (regex.test(content)) {
      found.push(label);
    }
  }

  return found;
}

// Settings functionality
function setupSettings() {
  const form = document.getElementById("settingsForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const selected = Array.from(
      document.getElementById("flagTypes").selectedOptions
    ).map((o) => o.value);
    localStorage.setItem("dlpSettings", JSON.stringify(selected));
    document.getElementById("settingsStatus").innerText = `Settings saved. ${selected.join(", ")}`;
  });
}

// Reports download functionality with dropdown for data selection
function setupReports() {
  document
    .getElementById("reportForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get the selected data type from the dropdown
      const selectedDataType = document.getElementById("dataType").value;

      if (!selectedDataType) {
        document.getElementById("reportStatus").innerText = "Please select type of data compliance violation.";
        return;
      }

      try {
        // Construct the query string with the selected data type
        const queryParams = new URLSearchParams({ dataType: selectedDataType });

        // Make the request to the API with the selected data type
        const response = await fetch(`${api.reports}?${queryParams.toString()}`);

        if (response.ok) {
          // Get the blob (downloadable file)
          const blob = await response.blob();

          // Create a link element for downloading the file
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob); // Create a URL for the blob

          link.href = url;
          link.download = `${selectedDataType}_report.csv`; // File name can be dynamic

          // Trigger the download
          link.click();

          // Clean up the URL object
          URL.revokeObjectURL(url);

          // Show the download success message
          document.getElementById("reportStatus").innerText = "Report downloaded successfully!";
        } else {
          throw new Error("Failed to fetch the report.");
        }
      } catch (error) {
        document.getElementById("reportStatus").innerText = "Error downloading the report.";
        console.error(error);
      }
    });
}
