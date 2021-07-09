'use strict';

const searchForm = document.getElementById('search-form');
const btnSearch = document.querySelector('.btn-search');
const movie = document.querySelector('#movies');

const API_KEY = 'd73b2b7697bc90c2980b57f447140eee';
const API_URL = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=ru-RU&query=`;
const API_TRENDING = `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}&language=ru-RU`;
const POSTER_URL = 'https://image.tmdb.org/t/p/w500/';

function addMediaHandler() {
  const media = movie.querySelectorAll('img[data-id]');
  media.forEach(function (elem) {
    elem.style.cursor = 'pointer';
    elem.addEventListener('click', showFullInfo);
  });
}

function showFullInfo() {
  let url = '';
  const typeMedia = this.dataset.type;
  const id = this.dataset.id;
  if (typeMedia === 'movie') {
    url = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=ru-RU`;
  } else if (typeMedia === 'tv') {
    url = `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=ru-RU`;
  } else {
    movie.innerHTML =
      '<h2 class="col-12 text-center text-danger">Произошла ошибка. Повторите позже!</h2>';
  }

  fetch(url)
    .then(function (value) {
      if (value.status !== 200) {
        return Promise.reject(new Error(value.status));
      }
      return value.json();
    })
    .then(function (output) {
      movie.innerHTML = `
      <h4 class="col-12 text-center text-default">${
        output.name || output.title
      }</h4>
      <div class="col-4">
        <img src='${
          output.poster_path
            ? POSTER_URL + output.poster_path
            : './img/no-poster.jpg'
        }' alt='${output.name || output.title}'>
        ${
          output.homepage
            ? '<p class="text-center"><a href="${output.homepage}" target="_blank">Официальная страница</a></p>'
            : ''
        }
        </div>
        <div class="col-8">
          <p>Рейтинг: ${output.vote_average}</p>
          <p>Жанр: ${output.genres
            .map(genre => {
              return genre.name;
            })
            .join(', ')}</p>
          <p>Вышел: ${output.first_air_date || output.release_date}</p>
          ${
            output.number_of_seasons
              ? `<p> Количество сезонов: ${output.number_of_seasons}</p>`
              : ''
          }
          
          <p>Описание: ${output.overview}</p>
          <div class="youtube"></div>
        </div>
      `;

      getVideo(typeMedia, id);
    })
    .catch(err => {
      movie.innerHTML = `Упс! Что-то пошло не так. Ошибка ${err.status}`;

      console.error(err.status);
    });
}

document.addEventListener('DOMContentLoaded', function () {
  fetch(API_TRENDING)
    .then(function (value) {
      if (value.status !== 200) {
        return Promise.reject(new Error(value.status));
      }
      return value.json();
    })
    .then(function (output) {
      let html =
        '<h4 class="col-12 text-center text-info">Популярные за неделю</h4>';
      if (output.results.length === 0) {
        html =
          '<h2 class="col-12 text-center text-info">Ничего не найдено</h2>';
      }
      output.results.forEach(function (item) {
        let movieName = item.name || item.title;
        let mediaType = item.title ? 'movie' : 'tv';
        let movieReleaseDate = new Date(
          item.release_date || item.first_air_date
        ).toLocaleString('ru', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const poster = item.poster_path
          ? POSTER_URL + item.poster_path
          : './img/no-poster.jpg';

        let dataInfo = `data-id="${item.id}" data-type="${mediaType}"`;

        html += `
    <div class="col-12 col-md-6 col-xl-3 item">
    <img src=${poster} alt="${movieName}" ${dataInfo}>
    <h5>${movieName}(${movieReleaseDate})</h5>
    </div>`;
      });
      movie.innerHTML = html;
      addMediaHandler();
    })
    .catch(err => {
      movie.innerHTML = `Упс! Что-то пошло не так. Ошибка ${err.status}`;
      console.log(err.status);
    });
});

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
      let html = '';
      if (output.results.length === 0) {
        html =
          '<h2 class="col-12 text-center text-info">Фильмы с таким названием не найдены</h2>';
      }
      output.results.forEach(function (item, i) {
        let movieName = item.name || item.title;
        let movieReleaseDate = new Date(
          item.release_date || item.first_air_date
        ).toLocaleString('ru', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

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
      addMediaHandler();
    })
    .catch(err => {
      movie.innerHTML = `Упс! Что-то пошло не так. Ошибка ${err.status}`;
      console.log(err || err.status);
    });
}

searchForm.addEventListener('submit', apiSearch);

function getVideo(type, id) {
  let youtube = movie.querySelector('.youtube');
  youtube.innerHTML = type;
  fetch(
    `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${API_KEY}&language=ru-RU`
  )
    .then(function (value) {
      if (value.status !== 200) {
        return Promise.reject(new Error(value.status));
      }
      return value.json();
    })
    .then(output => {
      let videoFrame = '<h4 class="col-12 text-info">Трейлеры</h4>';
      if (output.results.length < 1) {
        videoFrame = '<p>Доступные для просмотра трейлеры отсутствуют</p>';
      }

      output.results.forEach(item => {
        const trailer = item.key
          ? (videoFrame += `<iframe width="560" height="315" src="https://www.youtube.com/embed/${item.key}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`)
          : ' ';
      });
      youtube.innerHTML = videoFrame;
    })
    .catch(err => {
      youtube.innerHTML = `Видео отсутствует`;
      console.log(err.status);
    });
}
