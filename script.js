const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT58yRSpXYEVR4FHUEnydpmgBn4dyIVfM3-NvAry0zD593tk90QDaz7mNEpqAEgHu4jTr0PBk53P8AS/pub?gid=0&single=true&output=csv";

let songs = [];

const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const resultCount = document.getElementById("resultCount");


async function loadSongs() {

  try {

    const response = await fetch(
      CSV_URL + "&t=" + Date.now(),
      {
        cache: "no-store"
      }
    );

    const csvText = await response.text();

    console.log("読み込んだCSV:", csvText);

    songs = parseCSV(csvText);

    console.log("データを読み込みました！", songs);

  } catch (error) {

    console.error("データの読み込みに失敗しました", error);

    results.innerHTML =
      "データの読み込みに失敗しました";

  }

}


function parseCSV(csvText) {

  const lines = csvText
    .trim()
    .split(/\r?\n/);

  const headers = lines[0]
    .split(",")
    .map(header => header.trim());


  return lines
    .slice(1)
    .map(line => {

      const values = line
        .split(",")
        .map(value => value.trim());


      const song = {};


      headers.forEach((header, index) => {

        song[header] =
          values[index] || "";

      });


      return song;

    });

}


searchInput.addEventListener(
  "input",
  searchSongs
);


function searchSongs() {

  const keyword = searchInput.value
    .trim()
    .toLowerCase();


  if (keyword === "") {

    results.innerHTML =
      "曲名を検索してください";

    resultCount.textContent =
      "";

    return;

  }
