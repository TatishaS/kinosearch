'use strict';

const searchForm = document.getElementById('search-form');
const btnSearch = document.querySelector('.btn-search');
const movie = document.getElementById('movies');

const API_KEY = 'd73b2b7697bc90c2980b57f447140eee';
const API_URL = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=ru-RU&query=`;

function apiSearch(e) {
  e.preventDefault();
  const searchText = document.querySelector('.form-control').value;
  const server = API_URL + searchText;
  movie.innerHTML = 'Загрузка';
  requestAPI(server)
    .then(function (result) {
      const output = JSON.parse(result);
      console.log(output);
      let html = '';
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
        html += `<div class="col-5">${movieName} (${movieReleaseDate})</div>`;
      });
      movie.innerHTML = html;
    })
    .catch(err => {
      movie.innerHTML = `Упс! Что-то пошло не так. Ошибка ${err.status}`;
      console.log(err.status);
    });
}

searchForm.addEventListener('submit', apiSearch);

function requestAPI(url) {
  return new Promise(function (resolve, reject) {
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.addEventListener('load', function () {
      if (request.status !== 200) {
        reject({ status: request.status });
        return;
      }
      resolve(request.response);
    });
    request.addEventListener('error', function () {
      reject({ status: request.status });
    });
    request.send();
  });
}
