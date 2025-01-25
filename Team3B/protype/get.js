
async function getDocumentById(docId) {
    try {
        const response = await fetch(`http://localhost:3000/api/documents/${docId}`);
        const data = await response.json();
        if (data.document) {
            console.log('Document:', data.document);
        } else {
            console.log('Document not found');
        }
    } catch (error) {
        console.error('Error fetching document:', error);
    }
}


getDocumentById(1);
