'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentVideo } from '@/store/slices/playerSlice';
import Hero from '@/components/Hero';
import FeaturedContent from '@/components/FeaturedContent';
import ContentRow from '@/components/ContentRow';
import { useQuery } from '@tanstack/react-query';
import { fetchTrending, fetchTopRated, fetchActionMovies, fetchComedies } from '@/lib/api';

export default function Home() {
  const dispatch = useDispatch();

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrending,
  });

  const { data: topRated } = useQuery({
    queryKey: ['topRated'],
    queryFn: fetchTopRated,
  });

  const { data: actionMovies } = useQuery({
    queryKey: ['actionMovies'],
    queryFn: fetchActionMovies,
  });

  const { data: comedies } = useQuery({
    queryKey: ['comedies'],
    queryFn: fetchComedies,
  });

  useEffect(() => {
    // Reset video player state when navigating away
    return () => {
      dispatch(setCurrentVideo(null));
    };
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-netflix-black">
      <Hero />
      <div className="relative z-10 -mt-32">
        <FeaturedContent />
        <div className="space-y-8 pb-8">
          <ContentRow
            title="Trending Now"
            content={trending}
            type="movie"
          />
          <ContentRow
            title="Top Rated"
            content={topRated}
            type="movie"
          />
          <ContentRow
            title="Action Movies"
            content={actionMovies}
            type="movie"
          />
          <ContentRow
            title="Comedies"
            content={comedies}
            type="movie"
          />
        </div>
      </div>
    </main>
  );
} 