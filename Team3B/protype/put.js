
async function updateDocument(docId, updatedTitle, updatedContent) {
    try {
        const response = await fetch(`http://localhost:3000/api/documents/${docId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: updatedTitle,
                content: updatedContent,
            }),
        });
        const data = await response.json();
        if (data.document) {
            console.log('Document updated:', data.document);
        } else {
            console.log('Error updating document:', data.error);
        }
    } catch (error) {
        console.error('Error updating document:', error);
    }
}


updateDocument(1, 'Updated Title', 'Updated content for document.');
