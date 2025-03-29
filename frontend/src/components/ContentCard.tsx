'use client';

import { useState } from 'react';
import { Movie, TVShow, getImageUrl } from '@/lib/api';
import { PlayIcon, PlusIcon, ThumbUpIcon, VolumeOffIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface ContentCardProps {
  content: Movie | TVShow;
  type: 'movie' | 'tv';
}

export default function ContentCard({ content, type }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isMovie = 'title' in content;
  const title = isMovie ? content.title : content.name;
  const releaseDate = isMovie ? content.release_date : content.first_air_date;
  const year = new Date(releaseDate).getFullYear();

  return (
    <div
      className="relative h-28 min-w-[180px] cursor-pointer transition duration-200 ease-out md:h-36 md:min-w-[260px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={getImageUrl(content.backdrop_path || content.poster_path, 'w500')}
        alt={title}
        className="rounded-sm object-cover md:rounded"
      />

      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 bg-netflix-black/80"
        >
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-opacity-80">
                <PlayIcon className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white hover:bg-white hover:text-black">
                <PlusIcon className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white hover:bg-white hover:text-black">
                <ThumbUpIcon className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white hover:bg-white hover:text-black">
                <VolumeOffIcon className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-2 text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-xs text-netflix-gray-light">{year}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
} 