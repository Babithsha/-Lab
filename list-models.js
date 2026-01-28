const https = require('https');

const apiKey = "AIzaSyD4b2GoELGIRRAEMrTzrX61VabRntuIuc8";

function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                const json = JSON.parse(data);
                console.log("Available Models:");
                json.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods?.join(', ')})`));
            } else {
                console.log("Failed to list models:", res.statusCode);
                console.log(data);
            }
        });
    });
}

listModels();
