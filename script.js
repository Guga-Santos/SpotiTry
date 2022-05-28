const CLIENT_ID = '8297def4362d4f30b658b90c5ece35d7';
const CLIENT_SECRET = '0f5d8cf78bfb4411b6512dba7d5c3d93';
let token;


// const getElementOrClosest = (sectionClass, target) => {
//   return target.classList.contains(sectionClass)
//   ? target
//   : target.closest(sectionClass);
// };
// Esta maneira é a encontrada por Noel para contornar o pointer-events:none;



// ----------------------Faz a requisição do Token------------------------
const getToken = async () => {
  const requestInfo = {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials',
  };


  const response = await fetch('https://accounts.spotify.com/api/token', requestInfo)
  const data = await response.json();
  return data.access_token;

};
// -----------------------------------------------------------------------

//------------------Faz a Requisição das categorias-----------------------
const getGenres = async (token) => {
  const requestInfo = {
    method: 'GET',
    headers: {
      Authorization:`Bearer ${token}`
    }
  };

  const url = `https://api.spotify.com/v1/browse/categories?locale=pt-br`
  const response = await fetch(url, requestInfo);
  const data = await response.json();
  return data.categories.items;
  
};
// -----------------------------------------------------------------------

const getPlayLists = async (token, id) => { 
  const requestInfo = {
    method: 'GET',
    headers: {
      Authorization:`Bearer ${token}`
    }
  };

  const url = `https://api.spotify.com/v1/browse/categories/${id}/playlists`;
  const response = await fetch(url, requestInfo);
  const data = await response.json();
  return data.playlists.items;

};

// ------------------------------------------------------------------------

const getTracks = async (token, id) => { 
  const requestInfo = {
    method: 'GET',
    headers: {
      Authorization:`Bearer ${token}`
    }
  };

  const url = `https://api.spotify.com/v1/playlists/${id}/tracks`;
  const response = await fetch(url, requestInfo);
  const data = await response.json();
  return data.items;

};

// ------------------------------------------------------------------------

const getSearch = async (token, artist) => { 
  const requestInfo = {
    method: 'GET',
    headers: {
      Authorization:`Bearer ${token}`
    }
  };

  const url = `https://api.spotify.com/v1/search?q=name:${artist}&type=artist`;
  const response = await fetch(url, requestInfo);
  const data = await response.json();
  // return data;

  console.log(data)
};

// ------------------------------------------------------------------------

const clearSelectedItem = (containerSelector) => {
  const element = document.querySelector(`${containerSelector} .item-selected`);
  if(element) { 
  element.classList.remove('item-selected')
  }
};

const handleGenreCardClick = async (event) => {
  const genreSection = event.target;
  const id = genreSection.id;

  clearSelectedItem('.genre-cards');
  genreSection.classList.add('item-selected');

  const playlists = await getPlayLists(token, id);
  document.querySelector('.playlist-cards').innerHTML = ''
  renderPlayLists(playlists)

  console.log(event.target)

};

const handlePlaylistCardClick = async (event) => {
  const playlistSection = event.target;
  const id = playlistSection.id;

  clearSelectedItem('.playlist-cards');
  playlistSection.classList.add('item-selected');

  const tracks = await getTracks(token, id);
  document.querySelector('.tracks-cards').innerHTML = ''
  renderTracks(tracks)

  console.log(event.target)

};

const handleTracksClick = async (event) => {
  const tracksSection = event.target;
  const id = tracksSection.id;

  clearSelectedItem('.tracks-cards');
  tracksSection.classList.add('item-selected');

  const player = document.querySelector('#player');
  if(player) {
    player.querySelector('source').src = tracksSection.value
    player.load()
  } else { 
  createPlayer(tracksSection.value)
  }
  const musicName = document.querySelector('#playing-music-name');
  musicName.innerText = event.target.innerText

};

// ---------Acessa o data e cria a section de categorias------------------
const renderGenres = (genres) => {
  const genresCards = document.querySelector('.genre-cards');

  genres.forEach((genre) => {
    const section = document.createElement('section');
    section.className = 'genre';
    section.id = genre.id;

    const paragraph = document.createElement('p');
    paragraph.className = 'genre-title';
    paragraph.innerHTML = genre.name;

    const img = document.createElement('img');
    img.className = 'genre-image';
    img.src = genre.icons[0].url;

    section.appendChild(img);
    section.appendChild(paragraph);
    section.addEventListener('click', handleGenreCardClick);

    genresCards.appendChild(section);
  });

};
// ----------------------------------------------------------------------

const renderPlayLists = (playlists) => {
  const playlistsCards = document.querySelector('.playlist-cards');

  playlists.forEach((playlist) => {
    const section = document.createElement('section');
    section.className = 'playlist text-card';
    section.id = playlist.id;

    const paragraph = document.createElement('p');
    paragraph.className = 'playlist-title';
    paragraph.innerHTML = playlist.name;

    section.appendChild(paragraph);
    section.addEventListener('click', handlePlaylistCardClick);

    playlistsCards.appendChild(section);
  });

};

// -----------------------------------------------------------------

const renderTracks = (tracks) => {
  const playlistsCards = document.querySelector('.tracks-cards');

  tracks
  .filter((track) => track.track?.preview_url !== null)
  .forEach((track) => {
    const section = document.createElement('section');
    section.className = 'track text-card';
    section.id = track.id;
    section.value = track.track.preview_url;

    const paragraph = document.createElement('p');
    paragraph.className = 'track-title';
    paragraph.id = track.track.preview_url
    paragraph.innerHTML = `${track.track.name} - ${track.track.artists[0].name}`;


    section.appendChild(paragraph);
    section.addEventListener('click', handleTracksClick);

    playlistsCards.appendChild(section);
  });

};

// --------------------------------------------------------------------------

const createPlayer = (src) => {
  const audio = document.createElement('audio');
  audio.controls = true;
  audio.autoplay = true;
  audio.id = 'player';

  const source = document.createElement('source');
  source.src = src;
  audio.appendChild(source)

  document.querySelector('.player-container').appendChild(audio)

}; 

// --------------------------------------------------------------------------

const logoTitle = document.querySelector('.logo-title');
logoTitle.addEventListener('click', () => {
  location.reload()
});

window.onload = async () => {
  try { 
  token = await getToken();
  const genres = await getGenres(token);
  renderGenres(genres)
  } catch(error) {
    return error
  }
};

