let model;

let detectedObjects = [];

let originalImage = new Image();

let selectedObjectIndex = null;

let processedImage = null;

document.addEventListener("DOMContentLoaded", function () {

    const imageUpload = document.getElementById("imageUpload");

    const canvas = document.getElementById("canvas");

    const ctx = canvas.getContext("2d");

    const objectSelector = document.getElementById("objectSelector");

    const targetColorPicker = document.getElementById("targetColorPicker");

    const newColorPicker = document.getElementById("newColorPicker");

    const applyColor = document.getElementById("applyColor");

    const loadingSpinner = document.createElement("div");
    loadingSpinner.id = "loadingSpinner";
    loadingSpinner.style.display = "none";
    loadingSpinner.style.position = "absolute";
    loadingSpinner.style.top = "50%";
    loadingSpinner.style.left = "50%";
    loadingSpinner.style.transform = "translate(-50%, -50%)";
    loadingSpinner.style.border = "8px solid #f3f3f3";
    loadingSpinner.style.borderTop = "8px solid #007BFF";
    loadingSpinner.style.borderRadius = "50%";
    loadingSpinner.style.width = "50px";
    loadingSpinner.style.height = "50px";
    loadingSpinner.style.animation = "spin 1s linear infinite";
    document.body.appendChild(loadingSpinner);

    const style = document.createElement("style");
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    async function loadModel() {

        model = await cocoSsd.load();

    }

    imageUpload.addEventListener("change", function (event) {

        if (!model) return;

        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (e) {

            originalImage.src = e.target.result;

        };

        reader.readAsDataURL(file);

    });

    originalImage.onload = function () {

        const maxWidth = 800; // Maximum width
        const maxHeight = 600; // Maximum height

        let width = originalImage.width;
        let height = originalImage.height;

        // Scale down the image if it exceeds the maximum dimensions
        if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            if (width > height) {
                width = maxWidth;
                height = Math.round(maxWidth / aspectRatio);
            } else {
                height = maxHeight;
                width = Math.round(maxHeight * aspectRatio);
            }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(originalImage, 0, 0, width, height);

        processedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

        detectObjects();

    };

    async function detectObjects() {
        loadingSpinner.style.display = "block";
        detectedObjects = await model.detect(canvas);
        loadingSpinner.style.display = "none";
        updateObjectSelector();
        highlightObjects();
    }

    function updateObjectSelector() {

        objectSelector.innerHTML = "<option value='' disabled selected>Select an object</option>";

        detectedObjects.forEach((prediction, index) => {

            const option = document.createElement("option");

            option.value = index;

            option.textContent = `${prediction.class} (${index + 1})`;

            objectSelector.appendChild(option);

        });

    }

    function highlightObjects() {

        ctx.putImageData(processedImage, 0, 0);

        detectedObjects.forEach((prediction, index) => {

            const [x, y, width, height] = prediction.bbox;

            ctx.strokeStyle = index === selectedObjectIndex ? "blue" : "red";

            ctx.lineWidth = 3;

            ctx.strokeRect(x, y, width, height);

            // Add animation for bounding boxes
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "rgba(0, 123, 255, 0.2)";
            ctx.fillRect(x, y, width, height);
            ctx.globalAlpha = 1.0;

        });

    }

    objectSelector.addEventListener("change", function () {

        selectedObjectIndex = parseInt(objectSelector.value, 10);

        highlightObjects();

    });

    canvas.addEventListener("click", function (event) {

        const rect = canvas.getBoundingClientRect();

        const x = event.clientX - rect.left;

        const y = event.clientY - rect.top;

        const pixelData = ctx.getImageData(x, y, 1, 1).data;

        targetColorPicker.value = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);

    });

    applyColor.addEventListener("click", function () {

        const targetColor = targetColorPicker.value;

        const newColor = newColorPicker.value;

        if (selectedObjectIndex !== null) {

            changeObjectColor(selectedObjectIndex, targetColor, newColor);

        } else {

            changeWholeImageColor(targetColor, newColor);

        }

    });

    function changeObjectColor(index, targetColor, newColor) {

        const [x, y, width, height] = detectedObjects[index].bbox;

        const imageData = ctx.getImageData(x, y, width, height);

        replaceColors(imageData, targetColor, newColor);

        ctx.putImageData(imageData, x, y);

        processedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

    }

    function changeWholeImageColor(targetColor, newColor) {

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        replaceColors(imageData, targetColor, newColor);

        ctx.putImageData(imageData, 0, 0);

        processedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

    }

    function replaceColors(imageData, targetColor, newColor) {

        const pixels = imageData.data;

        const targetRGB = hexToRgb(targetColor);

        const newRGB = hexToRgb(newColor);

        for (let i = 0; i < pixels.length; i += 4) {

            if (isCloseColor(pixels, i, targetRGB)) {

                pixels[i] = newRGB.r;

                pixels[i + 1] = newRGB.g;

                pixels[i + 2] = newRGB.b;

            }

        }

    }

    function isCloseColor(pixels, index, targetColor) {

        return (

            Math.abs(pixels[index] - targetColor.r) < 30 &&

            Math.abs(pixels[index + 1] - targetColor.g) < 30 &&

            Math.abs(pixels[index + 2] - targetColor.b) < 30

        );

    }

    function hexToRgb(hex) {

        let r = parseInt(hex.slice(1, 3), 16);

        let g = parseInt(hex.slice(3, 5), 16);

        let b = parseInt(hex.slice(5, 7), 16);

        return { r, g, b };

    }

    function rgbToHex(r, g, b) {

        return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);

    }

    loadModel();

});