const testData = [
    { image: "images/ishihara1.jpg", correct: "12", type: "Normal Vision" },
    { image: "images/ishihara2.jpg", correct: "8", type: "Deuteranopia (Red-Green)" },
    { image: "images/ishihara3.jpg", correct: "6", type: "Protanopia (Red-Green)" },
    { image: "images/ishihara4.jpg", correct: "45", type: "Tritanopia (Blue-Yellow)" },
    { image: "images/ishihara5.jpg", correct: "5", type: "Severe Color Blindness" }
];

let currentIndex = 0;
let userResults = [];

function loadQuestion() {
    if (currentIndex < testData.length) {
        document.getElementById("test-image").src = testData[currentIndex].image;
    } else {
        evaluateResult();
    }
}

function nextQuestion() {
    const userInput = document.getElementById("user-input").value.trim();
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
}

function restartTest() {
    currentIndex = 0;
    userResults = [];
    document.getElementById("test-container").classList.remove("hidden");
    document.getElementById("result").classList.add("hidden");
    loadQuestion();
}

document.getElementById("submit-button").addEventListener("click", nextQuestion);
document.getElementById("restart-button").addEventListener("click", restartTest);

loadQuestion();
