
async function deleteDocument(docId) {
    try {
        const response = await fetch(`http://localhost:3000/api/documents/${docId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (data.document) {
            console.log('Document deleted:', data.document);
        } else {
            console.log('Error deleting document:', data.error);
        }
    } catch (error) {
        console.error('Error deleting document:', error);
    }
}


deleteDocument(1);
