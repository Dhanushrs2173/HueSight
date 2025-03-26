document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const captureButton = document.getElementById("captureButton");
    const downloadButton = document.getElementById("downloadButton");
    const simulateButton = document.getElementById("simulateButton");
    const resetButton = document.getElementById("resetButton");

    // Start camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((err) => {
            console.error("Camera error:", err);
        });

    // Capture image
    captureButton.addEventListener("click", function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    });

    // Download image
    downloadButton.addEventListener("click", function () {
        const link = document.createElement("a");
        link.download = "processed_image.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });

    // Simulate Color Blindness (Protanopia)
    simulateButton.addEventListener("click", function () {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
            let avg = (r + g + b) / 3;
            pixels[i] = avg;   
            pixels[i + 1] = avg * 0.8;
            pixels[i + 2] = avg * 0.6;
        }

        ctx.putImageData(imageData, 0, 0);
    });

    // Reset Image
    resetButton.addEventListener("click", function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
});
