import fetch from 'node-fetch';


const apiUrl = 'http://localhost:3000/api/documents';


async function getDocuments() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('All Documents:', data.documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
}


getDocuments();
