// Show/hide pages and load history when 'history' page is selected
function showPage(pageId) {
    document.querySelectorAll('.main-container').forEach(function(container) {
        container.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'flex';

    // Load history data if history page is shown
    if (pageId === 'history') {
        loadHistory();
    }
}

// New function to save history to backend
async function saveHistory(type, content) {
    try {
        const response = await fetch("http://localhost:5000/api/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, content }),
        });
        if (!response.ok) throw new Error("Failed to save history");
        const data = await response.json();
        console.log("Saved history:", data);
    } catch (error) {
        console.error("Error saving history:", error);
    }
}

// Speech to Text variables
let recognition;
let recognizing = false;

document.getElementById('start-btn').addEventListener('click', function() {
    if (!recognizing) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = document.getElementById('input-language').value;
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript + ' ';
            }
            transcript = transcript.trim();
            document.getElementById('transcription').innerText = transcript;

            // Save transcript to backend history
            saveHistory("speech", transcript);

            // Translate the recognized text
            translateText(transcript);
        };
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
        };
        recognition.onend = function() {
            recognizing = false;
        };
        recognition.start();
        recognizing = true;
    }
});

document.getElementById('stop-btn').addEventListener('click', function() {
    if (recognizing) {
        recognition.stop();
        recognizing = false;
    }
});

document.getElementById('clear-btn').addEventListener('click', function() {
    document.getElementById('transcription').innerText = '';
});

function translateText(text) {
    const inputLang = document.getElementById('input-language').value;
    const outputLang = document.getElementById('output-language').value;
    if(text.length === 0) return;

    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${inputLang}|${outputLang}&key=cecfb14786e73f0d62bf`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const translatedText = data.responseData.translatedText;
            const transcriptionElem = document.getElementById('transcription');
            transcriptionElem.innerText = transcriptionElem.innerText + '\n\nTranslation: ' + translatedText;
        })
        .catch(error => {
            console.error('Error translating text:', error);
        });
}

// Load history from backend and display in history page
async function loadHistory() {
    try {
        const response = await fetch("http://localhost:5000/api/history");
        if (!response.ok) throw new Error("Failed to fetch history");
        const historyData = await response.json();

        const historyListElem = document.getElementById("history-list");
        historyListElem.innerHTML = ''; // Clear existing content

        if (historyData.length === 0) {
            historyListElem.innerHTML = '<p>No history found.</p>';
            return;
        }

        const ul = document.createElement("ul");
        historyData.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>Type:</strong> ${item.type} <br> <strong>Content:</strong> ${item.content}`;
            ul.appendChild(li);
        });

        historyListElem.appendChild(ul);
    } catch (error) {
        console.error("Error loading history:", error);
        document.getElementById("history-list").innerHTML = '<p>Failed to load history.</p>';
    }
}

// Signs to Text - Camera handling
let videoStream;

document.getElementById('start-camera-btn').addEventListener('click', function() {
    if (!videoStream) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                videoStream = stream;
                document.getElementById('video').srcObject = stream;
            })
            .catch(function(error) {
                console.error('Error accessing webcam:', error);
            });
    }
});

document.getElementById('stop-camera-btn').addEventListener('click', function() {
    if (videoStream) {
        let tracks = videoStream.getTracks();
        tracks.forEach(track => track.stop());
        videoStream = null;
        document.getElementById('video').srcObject = null;
    }
});

