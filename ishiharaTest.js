const testData = [
    { image: "IshiharaTestImages/Ishihara_00.jpg", correct: "12", type: "Normal Vision" },
    { image: "IshiharaTestImages/Ishihara_10.jpg", correct: "8", type: "Deuteranopia (Red-Green)" },
    { image: "IshiharaTestImages/Ishihara_02.jpg", correct: "6", type: "Protanopia (Red-Green)" },
    { image: "IshiharaTestImages/Ishihara_07.jpg", correct: "45", type: "Tritanopia (Blue-Yellow)" },
    { image: "IshiharaTestImages/Ishihara_08.jpg", correct: "5", type: "Severe Color Blindness" },
    { image: "IshiharaTestImages/Ishihara_04.jpg", correct: "2", type: "Normal Vision" },
    { image: "IshiharaTestImages/Ishihara_05.jpg", correct: "29", type: "Deuteranopia (Red-Green)" },
    { image: "IshiharaTestImages/Ishihara_01.jpg", correct: "74", type: "Protanopia (Red-Green)" },
    { image: "IshiharaTestImages/Ishihara_08.jpg", correct: "5", type: "Tritanopia (Blue-Yellow)" },
    { image: "IshiharaTestImages/Ishihara_07.jpg", correct: "45", type: "Severe Color Blindness" },
    { image: "IshiharaTestImages/Ishihara_06.jpg", correct: "7", type: "Normal Vision" },
    { image: "IshiharaTestImages/Ishihara_03.jpg", correct: "16", type: "Deuteranopia (Red-Green)" }
];

let currentIndex = 0;
let userResults = [];

function loadQuestion() {
    if (currentIndex < testData.length) {
        document.getElementById("test-image").src = testData[currentIndex].image;
        document.getElementById("current-question").textContent = currentIndex + 1;
        document.getElementById("total-questions").textContent = testData.length;

        // Update progress tracker
        const progress = ((currentIndex + 1) / testData.length) * 100;
        const progressBar = document.getElementById("progress-bar");
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    } else {
        evaluateResult();
    }
}

function nextQuestion() {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) {
        alert("Please enter a response before proceeding.");
        return;
    }

    userResults.push({
        response: userInput,
        expected: testData[currentIndex].correct,
        type: testData[currentIndex].type
    });

    currentIndex++;
    document.getElementById("user-input").value = "";
    loadQuestion();
}

function evaluateResult() {
    let diagnosis = "Normal Vision";
    const typeCounts = {};

    userResults.forEach(q => {
        if (q.response !== q.expected) {
            typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
        }
    });

    if (Object.keys(typeCounts).length > 0) {
        diagnosis = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);
    }

    document.getElementById("test-container").classList.add("hidden");
    document.getElementById("result").classList.remove("hidden");
    document.getElementById("diagnosis").innerText = diagnosis;

    // Add smooth transition for result display
    document.getElementById("result").style.transition = "opacity 0.5s ease-in-out";
    document.getElementById("result").style.opacity = 1;
}

function restartTest() {
    currentIndex = 0;
    userResults = [];
    document.getElementById("test-container").classList.remove("hidden");
    document.getElementById("result").classList.add("hidden");
    document.getElementById("result").style.opacity = 0; // Reset opacity for smooth transition
    loadQuestion();
}

document.getElementById("submit-button").addEventListener("click", nextQuestion);
document.getElementById("restart-button").addEventListener("click", restartTest);

loadQuestion();
