const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT58yRSpXYEVR4FHUEnydpmgBn4dyIVfM3-NvAry0zD593tk90QDaz7mNEpqAEgHu4jTr0PBk53P8AS/pub?gid=0&single=true&output=csv";

let songs = [];

const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const suggestions =
  document.getElementById("suggestions");

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
  () => {

    searchSongs();

    showSuggestions();

  }
);

function normalizeText(text) {

  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[ァ-ヶ]/g, char =>
      String.fromCharCode(
        char.charCodeAt(0) - 0x60
      )
    );

}

function showSuggestions() {

  const keyword =
    normalizeText(searchInput.value);


  if (keyword === "") {

    suggestions.innerHTML = "";

    return;

  }


  // 曲名とアーティスト名の候補を集める
  const suggestionList =
    songs
      .filter(song => {

        const songName =
          normalizeText(song.song || "");

        const artistName =
          normalizeText(song.artist || "");

        return (
          songName.includes(keyword) ||
          artistName.includes(keyword)
        );

      })
      .slice(0, 8);


 suggestions.innerHTML =
  suggestionList
    .map(song => `

      <div
        class="suggestion-item"
        data-song="${song.song}"
      >

        ${song.song}
        - ${song.artist}

      </div>

    `)
    .join("");
  document
    .querySelectorAll(".suggestion-item")
    .forEach(item => {

      item.addEventListener("click", () => {

        searchInput.value =
          item.dataset.song;

        searchSongs();

        suggestions.innerHTML = "";

      });

    });
}

function searchSongs() {

const keyword =
  normalizeText(searchInput.value);


  if (keyword === "") {

    results.innerHTML =
      "曲名を検索してください";

    resultCount.textContent =
      "";

    return;

  }


  const filteredSongs =
  songs
    .filter(song => {

      const songName =
  normalizeText(song.song || "");

const artistName =
  normalizeText(song.artist || "");

return (
  songName.includes(keyword) ||
  artistName.includes(keyword)
);

    })
    .sort((a, b) => {

      const dateA =
        new Date(a.date);

      const dateB =
        new Date(b.date);

      return dateB - dateA;

    });


  resultCount.textContent =
    `${filteredSongs.length}件見つかりました`;


  if (filteredSongs.length === 0) {

    results.innerHTML =
      "見つかりませんでした";

    return;

  }


  results.innerHTML =
    filteredSongs
      .map(song => `

        <div class="card">

          <h2>
            🎵 ${song.song}
          </h2>

          <p>
  🎤 アーティスト：${song.artist}
</p>

          <p>
            📅 配信日：${song.date}
          </p>

          <p>
            📺 ${song.title}
          </p>

          <p>
            ⏰ ${song.time}頃
          </p>

          <a
            href="${song.url}"
            target="_blank"
          >
            アーカイブを見る
          </a>

        </div>

      `)
      .join("");

}


loadSongs().then(() => {

  const params = new URLSearchParams(
    window.location.search
  );

  const songFromURL = params.get("song");

  if (songFromURL) {

    searchInput.value = songFromURL;

    searchSongs();

  }

});
