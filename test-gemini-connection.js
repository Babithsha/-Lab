const https = require('https');
const fs = require('fs');

let apiKey = "AIzaSyD4b2GoELGIRRAEMrTzrX61VabRntuIuc8";

console.log("Testing Gemini API with key: " + apiKey.substring(0, 10) + "...");

const payloads = [
    { model: 'gemini-flash-latest', version: 'v1beta' },
    { model: 'gemini-pro-latest', version: 'v1beta' },
    { model: 'gemini-2.0-flash-lite-preview-02-05', version: 'v1beta' }
];

function testModel(modelConfig) {
    return new Promise((resolve) => {
        const url = `https://generativelanguage.googleapis.com/${modelConfig.version}/models/${modelConfig.model}:generateContent?key=${apiKey}`;

        try {
            const req = https.request(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log(`✅ SUCCESS: ${modelConfig.model} working`);
                        resolve({ name: modelConfig.model, ok: true });
                    } else {
                        console.log(`❌ FAILED: ${modelConfig.model} (${res.statusCode})`);
                        // console.log(data); // Uncomment to see full error
                        try {
                            const err = JSON.parse(data);
                            console.log(`   Error: ${err.error?.message || data.substring(0, 100)}`);
                        } catch (e) { console.log("   Raw error:", data.substring(0, 100)); }
                        resolve({ name: modelConfig.model, ok: false });
                    }
                });
            });

            req.on('error', (e) => {
                console.error(`Network Error for ${modelConfig.model}:`, e.message);
                resolve({ name: modelConfig.model, ok: false });
            });

            req.write(JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            }));
            req.end();

        } catch (error) {
            console.error("Request setup error:", error);
            resolve({ name: modelConfig.model, ok: false });
        }
    });
}

(async () => {
    console.log("Checking available models...");
    for (const p of payloads) {
        await testModel(p);
    }
})();
