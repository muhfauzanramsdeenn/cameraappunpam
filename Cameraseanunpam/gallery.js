setTimeout(() => {
  if (db) {
    let videoDbTransaction = db.transaction("video", "readonly");
    let videoStore = videoDbTransaction.objectStore("video");
    let videoRequest = videoStore.getAll(); //event driven

    videoRequest.onsuccess = (e) => {
      let videoResult = videoRequest.result;
      let galleryContainer = document.querySelector(".gallery-container");
      //   console.log(videoResult);
      videoResult.forEach((videoObject) => {
        let mediaElem = document.createElement("div");
        mediaElem.setAttribute("class", "media-box");
        mediaElem.setAttribute("id", videoObject.id);
        let videoUrl = URL.createObjectURL(videoObject.blobData);

        mediaElem.innerHTML = `
         <div class="media">
          <video autoplay loop src=${videoUrl}></video>
        </div>
        <div class="media-btns">
          <span class="material-symbols-outlined gallery-btns delete"> delete </span
          ><span class="material-symbols-outlined gallery-btns download">
            download
          </span>
        </div>
        `;
        galleryContainer.appendChild(mediaElem);

        let deleteBtn = mediaElem.querySelector(".delete");
        deleteBtn.addEventListener("click", handleDelete);
        let downloadBtn = mediaElem.querySelector(".download");
        downloadBtn.addEventListener("click", handleDownload);
      });
    };

    // ================================= Image =================================
    let imageDbTransaction = db.transaction("image", "readonly");
    let imageStore = imageDbTransaction.objectStore("image");
    let imageRequest = imageStore.getAll(); //event driven

    imageRequest.onsuccess = (e) => {
      let imageResult = imageRequest.result;
      let galleryContainer = document.querySelector(".gallery-container");
      //   console.log(videoResult);
      imageResult.forEach((imageObject) => {
        let mediaElem = document.createElement("div");
        mediaElem.setAttribute("class", "media-box");
        mediaElem.setAttribute("id", imageObject.id);
        let imageURL = imageObject.url;

        mediaElem.innerHTML = `
         <div class="media">
          <img src=${imageURL} />
        </div>
        <div class="media-btns">
          <span class="material-symbols-outlined gallery-btns delete"> delete </span
          ><span class="material-symbols-outlined gallery-btns download">
            download
          </span>
        </div>
        `;

        galleryContainer.appendChild(mediaElem);

        let deleteBtn = mediaElem.querySelector(".delete");
        deleteBtn.addEventListener("click", handleDelete);
        let downloadBtn = mediaElem.querySelector(".download");
        downloadBtn.addEventListener("click", handleDownload);
      });
    };
  }
}, 100);

//UI remove and DB remove
function handleDelete(e) {
  let id = e.target.closest(".media-box").getAttribute("id");
  let type = id.slice(0, 3);
  console.log(id);
  if (type === "vid") {
    let videoDbTransaction = db.transaction("video", "readwrite");
    let videoStore = videoDbTransaction.objectStore("video");
    videoStore.delete(id);
  } else if (type === "img") {
    console.log(id);

    let imageDbTransaction = db.transaction("image", "readwrite");
    let imageStore = imageDbTransaction.objectStore("image");
    imageStore.delete(id);
  }

  // Remove the media element from the UI
  e.target.closest(".media-box").remove();
}
function handleDownload(e) {
  //   console.log("download");
  let id = e.target.closest(".media-box").getAttribute("id");
  let type = id.slice(0, 3);
  if (type === "vid") {
    let videoDbTransaction = db.transaction("video", "readwrite");
    let videoStore = videoDbTransaction.objectStore("video");
    let videoRequest = videoStore.get(id);

    videoRequest.onsuccess = (e) => {
      let videoResult = videoRequest.result;
      let videoURL = URL.createObjectURL(videoResult.blobData);
      let a = document.createElement("a");
      a.href = videoURL;
      a.download = "Recording.mp4";
      a.click();
    };
  } else if (type === "img") {
    let imageDbTransaction = db.transaction("image", "readwrite");
    let imageStore = imageDbTransaction.objectStore("image");
    let imageRequest = imageStore.get(id);

    imageRequest.onsuccess = (e) => {
      let imageResult = imageRequest.result;
      let imageUrl = imageResult.url;
      let a = document.createElement("a");
      a.href = imageUrl;
      a.download = "Image.jpg";
      a.click();
    };
  }
}
