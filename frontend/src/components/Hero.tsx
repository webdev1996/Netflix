'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTrending, Movie, TVShow } from '@/lib/api';
import { PlayIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export default function Hero() {
  const [featuredContent, setFeaturedContent] = useState<Movie | TVShow | null>(null);
  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrending,
  });

  useEffect(() => {
    if (trending?.length) {
      const randomIndex = Math.floor(Math.random() * trending.length);
      setFeaturedContent(trending[randomIndex]);
    }
  }, [trending]);

  if (!featuredContent) return null;

  const isMovie = 'title' in featuredContent;
  const title = isMovie ? featuredContent.title : featuredContent.name;
  const releaseDate = isMovie ? featuredContent.release_date : featuredContent.first_air_date;
  const year = new Date(releaseDate).getFullYear();

  return (
    <div className="relative h-[80vh] w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={`https://image.tmdb.org/t/p/original${featuredContent.backdrop_path}`}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-netflix-black/50 to-netflix-black" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center px-4 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
          <p className="text-lg md:text-xl mb-6 text-netflix-gray-light">
            {year} • {featuredContent.vote_average.toFixed(1)} Rating
          </p>
          <p className="text-base md:text-lg mb-8 text-netflix-gray-light line-clamp-3">
            {featuredContent.overview}
          </p>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-md hover:bg-opacity-80 transition">
              <PlayIcon className="w-6 h-6" />
              Play
            </button>
            <button className="flex items-center gap-2 bg-netflix-gray/70 text-white px-6 py-2 rounded-md hover:bg-netflix-gray/80 transition">
              <InformationCircleIcon className="w-6 h-6" />
              More Info
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 