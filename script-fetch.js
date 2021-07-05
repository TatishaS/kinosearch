'use strict';

const searchForm = document.getElementById('search-form');
const btnSearch = document.querySelector('.btn-search');
const movie = document.getElementById('movies');

const API_KEY = 'd73b2b7697bc90c2980b57f447140eee';
const API_URL = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=ru-RU&query=`;
const POSTER_URL = 'https://image.tmdb.org/t/p/w500/';

function apiSearch(e) {
  e.preventDefault();
  const searchText = document.querySelector('.form-control').value;
  if (searchText.trim().length === 0) {
    movie.innerHTML =
      '<h2 class="col-12 text-center text-danger">Поле поиска должно быть заполнено!</h2>';
    return;
  }
  const server = API_URL + searchText;
  movie.innerHTML = '<div class="spinner"></div>';

  fetch(server)
    .then(function (value) {
      if (value.status !== 200) {
        return Promise.reject(new Error(value.status));
      }
      return value.json();
    })
    .then(function (output) {
      console.log(output.results);
      let html = '';
      if (output.results.length === 0) {
        html =
          '<h2 class="col-12 text-center text-info">Фильмы с таким названием не найдены</h2>';
      }
      output.results.forEach((item, i) => {
        let movieName = item.name || item.title;
        let movieReleaseDate = new Date(
          item.release_date || item.first_air_date
        ).toLocaleString('ru', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        console.log(movieName);
        console.log(movieReleaseDate);

        const poster = item.poster_path
          ? POSTER_URL + item.poster_path
          : './img/no-poster.jpg';

        let dataInfo = '';
        if (item.media_type === 'movie' || item.media_type === 'tv')
          dataInfo = `data-id="${item.id}" data-type="${item.media_type}"`;
        html += `
        <div class="col-12 col-md-6 col-xl-3 item">
        <img src=${poster} alt="${movieName}" ${dataInfo}>
        <h5>${movieName}(${movieReleaseDate})</h5>
        </div>`;
      });
      movie.innerHTML = html;

      const media = movie.querySelectorAll('.item');
      media.forEach(function (elem) {
        elem.addEventListener('click', showFullInfo);
      });
    })
    .catch(err => {
      movie.innerHTML = `Упс! Что-то пошло не так. Ошибка ${err.status}`;
      console.log(err.status);
    });
}

searchForm.addEventListener('submit', apiSearch);

function showFullInfo() {
  console.log('hi');
}
