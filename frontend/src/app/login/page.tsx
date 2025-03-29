'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      dispatch(setUser(userCredential.user));
      router.push('/browse');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      dispatch(setUser(userCredential.user));
      router.push('/browse');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/netflix-logo.png"
            alt="Netflix"
            width={150}
            height={40}
            className="mx-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-white">Sign In</h2>
          <p className="mt-2 text-netflix-gray-light">
            Please sign in to continue watching
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-netflix-gray-light">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md bg-netflix-gray/50 border-netflix-gray text-white px-3 py-2 focus:border-netflix-red focus:outline-none focus:ring-1 focus:ring-netflix-red"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-netflix-gray-light">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md bg-netflix-gray/50 border-netflix-gray text-white px-3 py-2 focus:border-netflix-red focus:outline-none focus:ring-1 focus:ring-netflix-red"
              required
            />
          </div>

          {error && (
            <p className="text-netflix-red text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-netflix-red text-white py-2 rounded-md hover:bg-netflix-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-netflix-gray"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-netflix-black text-netflix-gray-light">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-white text-black py-2 rounded-md hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image
              src="/google-logo.png"
              alt="Google"
              width={20}
              height={20}
            />
            Sign in with Google
          </button>
        </div>

        <p className="mt-8 text-center text-netflix-gray-light">
          Don't have an account?{' '}
          <a href="/signup" className="text-white hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
} 