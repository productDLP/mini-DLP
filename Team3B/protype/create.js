import fetch from 'node-fetch';

async function createDocument() {
    const response = await fetch('http://localhost:3000/api/documents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: 'My First Document',
            content: 'This is the content of my first document.',
        }),
    });

    const data = await response.json();
    console.log('Document Created:', data);
}

createDocument().catch((error) => console.error('Error:', error));
