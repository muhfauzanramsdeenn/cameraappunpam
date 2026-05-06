let db;
let openRequest = indexedDB.open("myDataBase");
openRequest.addEventListener("success", (e) => {
  console.log("Database sucsess");
  db = openRequest.result; //2nd if DB exists
});
openRequest.addEventListener("error", (e) => {
  console.log("Database error");
});
openRequest.addEventListener("upgradeneeded", (e) => {
  console.log("Database upgraded and initial DB creation");
  db = openRequest.result; //1st step when app laods

  //object store can only be created or, modified in updradeneeded
  db.createObjectStore("video", { keyPath: "id" });
  db.createObjectStore("image", { keyPath: "id" });
});
