import axios from 'axios';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const api = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

export const getImageUrl = (path: string, size: 'original' | 'w500' = 'original') => {
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const fetchTrending = async () => {
  const { data } = await api.get('/trending/all/day');
  return data.results;
};

export const fetchTopRated = async () => {
  const { data } = await api.get('/movie/top_rated');
  return data.results;
};

export const fetchActionMovies = async () => {
  const { data } = await api.get('/discover/movie', {
    params: {
      with_genres: 28,
    },
  });
  return data.results;
};

export const fetchComedies = async () => {
  const { data } = await api.get('/discover/movie', {
    params: {
      with_genres: 35,
    },
  });
  return data.results;
};

export const fetchMovieDetails = async (movieId: number) => {
  const { data } = await api.get(`/movie/${movieId}`, {
    params: {
      append_to_response: 'videos,credits',
    },
  });
  return data;
};

export const fetchTVShowDetails = async (tvId: number) => {
  const { data } = await api.get(`/tv/${tvId}`, {
    params: {
      append_to_response: 'videos,credits',
    },
  });
  return data;
};

export const searchContent = async (query: string) => {
  const { data } = await api.get('/search/multi', {
    params: {
      query,
    },
  });
  return data.results;
};

export const fetchGenres = async () => {
  const { data } = await api.get('/genre/movie/list');
  return data.genres;
}; 