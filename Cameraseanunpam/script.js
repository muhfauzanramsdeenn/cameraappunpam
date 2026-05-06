const video = document.querySelector("video");
const recordBtnContainer = document.querySelector(".record-btn-container");
const recordBtn = document.querySelector(".record-btn");
const captureBtn = document.querySelector(".capture-btn");
let transparentColor = "transparent";
let recordFlag = false;
let recorder;
let chunks = [];
const constraints = { audio: true, video: true };

// 1. Inisialisasi Kamera & MediaRecorder
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        video.srcObject = stream;
        recorder = new MediaRecorder(stream);

        recorder.addEventListener("start", () => {
            chunks = [];
        });

        recorder.addEventListener("dataavailable", (e) => {
            chunks.push(e.data);
        });

        recorder.addEventListener("stop", () => {
            let blob = new Blob(chunks, { type: "video/mp4" });
            if (db) {
                let videoId = shortid();
                let dbTransaction = db.transaction("video", "readwrite");
                let videoStore = dbTransaction.objectStore("video");
                let videoEntry = { id: `vid-${videoId}`, blobData: blob };
                videoStore.add(videoEntry);
            }
        });
    })
    .catch((err) => {
        alert("Kamera tidak dapat diakses. Pastikan menggunakan HTTPS.");
        console.error(err);
    });

// 2. Logika Recording
recordBtnContainer.addEventListener("click", () => {
    if (!recorder) return;
    recordFlag = !recordFlag;
    if (recordFlag) {
        recorder.start();
        recordBtn.classList.add("scale-record");
        startTimer();
    } else {
        recorder.stop();
        recordBtn.classList.remove("scale-record");
        stopTimer();
    }
});

// 3. Logika Capture & Stamping (Nama, NIM, Email)
captureBtn.addEventListener("click", () => {
    captureBtn.classList.add("scale-capture");

    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let tool = canvas.getContext("2d");

    // a. Gambar Frame Kamera
    tool.drawImage(video, 0, 0, canvas.width, canvas.height);

    // b. Gambar Filter Warna (Layer transparan)
    if (transparentColor && transparentColor !== "transparent") {
        tool.fillStyle = transparentColor;
        tool.fillRect(0, 0, canvas.width, canvas.height);
    }

    // c. Tambahkan Banner Atas (Biru UNPAM)
    let bannerHeight = canvas.height * 0.15; // Sedikit lebih tinggi untuk teks tambahan
    tool.fillStyle = "#1a0079"; 
    tool.fillRect(0, 0, canvas.width, bannerHeight);

    // d. Detail Teks Identitas
    let name = "Sean Theon Sarumaha";
    let nim = "231011402669";
    let email = "seansarumaha12@gmail.com";

    // Gaya Teks Identitas (Di dalam banner)
    tool.fillStyle = "white";
    tool.textAlign = "left";
    tool.textBaseline = "top";
    
    let fontSizeMain = Math.floor(bannerHeight * 0.25);
    let fontSizeSub = Math.floor(bannerHeight * 0.15);
    let textMargin = bannerHeight * 1.2; // Jarak setelah logo

    // Gambar Nama & Judul
    tool.font = `bold ${fontSizeMain}px Arial`;
    tool.fillText("Camera Booth Universitas Pamulang", textMargin, bannerHeight * 0.15);
    
    // Gambar NIM & Email
    tool.font = `${fontSizeSub}px Arial`;
    tool.fillText(`${name} | NIM: ${nim}`, textMargin, bannerHeight * 0.45);
    tool.fillText(`Email: ${email}`, textMargin, bannerHeight * 0.65);

    // e. Tambahkan Timestamp Retro (Bawah Kanan)
    let now = new Date();
    let fullTimestamp = now.toLocaleString('id-ID');
    tool.shadowColor = "black";
    tool.shadowBlur = 5;
    tool.fillStyle = "#ff8c00"; // Orange Retro
    tool.font = `bold ${Math.floor(canvas.height * 0.035)}px Courier New`;
    tool.textAlign = "right";
    tool.fillText(fullTimestamp, canvas.width - 20, canvas.height - 20);
    tool.shadowBlur = 0; // Reset shadow

    // f. Gambar Logo Secara Async
    let logo = new Image();
    logo.src = "images/logo_unpam.png"; 

    logo.onload = function() {
        let logoSize = bannerHeight * 0.8;
        let margin = (bannerHeight - logoSize) / 2;
        tool.drawImage(logo, margin * 2, margin, logoSize, logoSize);
        
        // Simpan ke database setelah semua komponen (termasuk logo) selesai digambar
        saveToDB(canvas.toDataURL("image/jpeg", 1.0));
    };

    logo.onerror = function() {
        console.warn("Logo gagal dimuat, menyimpan tanpa logo.");
        saveToDB(canvas.toDataURL("image/jpeg", 1.0));
    };

    function saveToDB(imageUrl) {
        if (db) {
            let imageId = shortid();
            let dbTransaction = db.transaction("image", "readwrite");
            let imageStore = dbTransaction.objectStore("image");
            let imageEntry = { id: `img-${imageId}`, url: imageUrl };
            imageStore.add(imageEntry);
        }
    }

    setTimeout(() => {
        captureBtn.classList.remove("scale-capture");
    }, 500);
});

// 4. Timer & Filter (Sama seperti sebelumnya)
let timerID, counter = 0;
let timer = document.querySelector(".timer"); // Pastikan selector sesuai HTML (.timer)
function startTimer() {
    timer.parentElement.style.display = "flex";
    function displayTimer() {
        let h = Math.floor(counter / 3600);
        let m = Math.floor((counter % 3600) / 60);
        let s = counter % 60;
        timer.innerText = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
        counter++;
    }
    timerID = setInterval(displayTimer, 1000);
}
function stopTimer() {
    clearInterval(timerID);
    counter = 0;
    timer.innerText = "00:00:00";
    timer.parentElement.style.display = "none";
}

let allFilters = document.querySelectorAll(".filter");
let filterLayer = document.querySelector(".filter-layer");
allFilters.forEach((filterItem) => {
    filterItem.addEventListener("click", () => {
        transparentColor = getComputedStyle(filterItem).getPropertyValue("background-color");
        filterLayer.style.backgroundColor = transparentColor;
    });
});