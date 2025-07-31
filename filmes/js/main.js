const apiKey = "dc340e81a2bdef1a7bcb0b31358487fd";
const imageBase = "https://image.tmdb.org/t/p/w500";
const backdropBase = "https://image.tmdb.org/t/p/w1280";

const movieGrid = document.getElementById("movieGrid");
const discoverBtn = document.getElementById("discoverButton");
const searchBtn = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
const genreSelect = document.getElementById("genreFilter");
const yearSelect = document.getElementById("yearFilter");
const spinner = document.getElementById("loadingSpinner");
const dialog = document.getElementById("movieDialog");
const closeDialog = document.getElementById("closeDialog");
const blurOverlay = document.getElementById("blurOverlay");

const d = id => document.getElementById(id);
const dialogInputs = {
  title: d("dialogTitle"),
  original_title: d("dialogOriginalTitle"),
  synopsis: d("dialogSynopsis"),
  runtime: d("dialogRuntime"),
  year: d("dialogYear"),
  release_date: d("dialogReleaseDate"),
  rating: d("dialogRating"),
  status: d("dialogStatus"),
  tmdb_rate: d("dialogTmdbRate"),
  genres: d("dialogGenres"),
  trailer_id: d("dialogTrailerId"),
  poster_image: d("dialogPosterImage"),
  backdrop_image: d("dialogBackdropImage")
};

let currentPage = 1;
let totalPages = 1;
let currentMode = "discover";
let currentQuery = "";
let currentGenre = "";
let currentYear = "";
let isLoading = false;

for (let y = 2025; y >= 1950; y--) {
  const opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearSelect.appendChild(opt);
}

function showSpinner() {
  spinner.style.display = "block";
}
function hideSpinner() {
  spinner.style.display = "none";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const date = new Date(dateStr);
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}

function fetchMovies(url, append = false) {
  isLoading = true;
  showSpinner();
  fetch(url)
    .then(res => res.json())
    .then(data => {
      displayMovies(data.results, append);
      totalPages = data.total_pages;
      isLoading = false;
      hideSpinner();
    })
    .catch(() => {
      isLoading = false;
      hideSpinner();
    });
}

function displayMovies(movies, append = false) {
  if (!append) movieGrid.innerHTML = "";
  if (!movies || movies.length === 0) {
    if (!append) movieGrid.innerHTML = "<p style='color:white'>No movies found.</p>";
    return;
  }
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    const formattedDate = formatDate(movie.release_date);
    card.innerHTML = `
      <img src="${imageBase + movie.poster_path}" alt="${movie.title}" />
      <div class="title">${movie.title}</div>
      <div class="release-date">${formattedDate}</div>
    `;
    card.addEventListener("click", () => showMovieDetails(movie.id));
    movieGrid.appendChild(card);
  });
}
//inicio
function showMovieDetails(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=es-ES&append_to_response=videos`;
  fetch(url)
    .then(res => res.json())
    .then(movie => {
      // Pedir ID manual para el servidor
      const customId = prompt("Ingresa el ID para el servidor:", "");

      dialogInputs.title.value = movie.title || "";
      dialogInputs.original_title.value = movie.original_title || "";
      dialogInputs.synopsis.value = movie.overview || "";
      dialogInputs.runtime.value = (movie.runtime || 0) + " min";
      dialogInputs.year.value = movie.release_date ? movie.release_date.split("-")[0] : "";
      dialogInputs.release_date.value = movie.release_date || "";
      dialogInputs.rating.value = movie.vote_average || "";
      dialogInputs.status.value = movie.status || "";
      dialogInputs.tmdb_rate.value = movie.vote_average || "";
      dialogInputs.genres.value = movie.genres?.map(g => g.name).join(", ") || "";
      dialogInputs.poster_image.value = imageBase + movie.poster_path;
      dialogInputs.backdrop_image.value = backdropBase + movie.backdrop_path;

      const trailer = movie.videos?.results.find(v => v.site === "YouTube" && v.type === "Trailer");
      const trailerId = trailer ? trailer.key : "";

      const htmlOutput = `
<!-- ${movie.title} -->
<!-- ${movie.genres.map(g => g.name).join(", ")},Movie,${movie.release_date ? movie.release_date.split("-")[0] : ""} -->

<!-- Post type -->
<!-- Plantillas CJ @PlantillasCJ JMA Plantillas -->
<div data-post-type="movie" hidden>
  <img src="${imageBase + movie.poster_path}" />
  <p id="tmdb-synopsis">${movie.overview}</p>
</div>

<!-- www.inkaflix.lat@PlantillasCJ JMA -->
<div class="headline is-small mb-4">
  <h2 class="headline__title">Informação</h2>
</div>
<ul
  class="post-details mb-4"
  data-youtube-id="${trailerId}" 
  data-backdrop="${backdropBase + movie.backdrop_path}"
  data-player-backdrop="${backdropBase + movie.backdrop_path}"
  data-imdb="${movie.vote_average}"
>
  <li data="${movie.title}"><span>Título</span>${movie.title}</li>
  <li data-original-title="${movie.original_title}">
    <span>Título original</span>${movie.original_title}
  </li>
  <li data-duartion="${movie.runtime} min">
    <span>Duração</span>${movie.runtime} min
  </li>
  <li data-year="${movie.release_date ? movie.release_date.split("-")[0] : ""}">
    <span>Ano</span>${movie.release_date ? movie.release_date.split("-")[0] : ""}
  </li>
  <li data-release-data="${movie.release_date}">
    <span>Data de Lançamento:</span>${movie.release_date}
  </li>
  <li data-genres="${movie.genres.map(g => g.name).join(", ")}">
    <span>Géneros</span>${movie.genres.map(g => g.name).join(", ")}
  </li>
</ul>

<!-- Server list -->
<div class="plyer-node" data-selected-lang="lat"></div>
<script>
  const _SV_LINKS = [
    {
      lang: "lat",
      name: "Servers",
      quality: "HD",
      url: "https://rdflix.online/#${customId || ''}",
      tagVideo: false
    }, 
  ]
</script>

<!-- ${movie.title} -->

<!-- ${movie.genres.map(g => g.name).join(", ")},Movie,${movie.release_date ? movie.release_date.split("-")[0] : ""} -->
`;

      navigator.clipboard.writeText(htmlOutput).then(() => {
        console.log("Nuevo HTML copiado al portapapeles");
      });

      dialog.classList.remove("hidden");
      blurOverlay.classList.remove("hidden");
      blurOverlay.classList.add("show");
    });
}
//fin
closeDialog.addEventListener("click", () => {
  dialog.classList.add("hidden");
  blurOverlay.classList.remove("show");
  blurOverlay.classList.add("hidden");
});

blurOverlay.addEventListener("click", () => {
  dialog.classList.add("hidden");
  blurOverlay.classList.remove("show");
  blurOverlay.classList.add("hidden");
});

discoverBtn.addEventListener("click", () => {
  currentPage = 1;
  currentMode = "discover";
  currentGenre = genreSelect.value;
  currentYear = yearSelect.value;

  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=es-ES&sort_by=popularity.desc&include_adult=false&page=${currentPage}`;
  if (currentGenre) url += `&with_genres=${currentGenre}`;
  if (currentYear) url += `&primary_release_year=${currentYear}`;
  fetchMovies(url);
});

searchBtn.addEventListener("click", () => {
  currentPage = 1;
  currentMode = "search";
  currentQuery = searchInput.value.trim();
  if (!currentQuery) return;

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=es-ES&query=${encodeURIComponent(currentQuery)}&page=${currentPage}&include_adult=false`;
  fetchMovies(url);
});

window.addEventListener("scroll", () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200 && !isLoading && currentPage < totalPages) {
    currentPage++;
    let url;
    if (currentMode === "discover") {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=es-ES&sort_by=popularity.desc&include_adult=false&page=${currentPage}`;
      if (currentGenre) url += `&with_genres=${currentGenre}`;
      if (currentYear) url += `&primary_release_year=${currentYear}`;
    } else if (currentMode === "search") {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=es-ES&query=${encodeURIComponent(currentQuery)}&page=${currentPage}&include_adult=false`;
    }
    if (url) fetchMovies(url, true);
  }
});