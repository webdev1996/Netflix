'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';
import Image from 'next/image';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date().toISOString(),
        plan: 'free',
        watchlist: [],
        continueWatching: [],
      });

      dispatch(setUser(userCredential.user));
      router.push('/browse');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date().toISOString(),
        plan: 'free',
        watchlist: [],
        continueWatching: [],
      });

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
          <h2 className="mt-6 text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-netflix-gray-light">
            Start your Netflix journey today
          </p>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-netflix-gray-light">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Create Account'}
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
            onClick={handleGoogleSignup}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-white text-black py-2 rounded-md hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image
              src="/google-logo.png"
              alt="Google"
              width={20}
              height={20}
            />
            Sign up with Google
          </button>
        </div>

        <p className="mt-8 text-center text-netflix-gray-light">
          Already have an account?{' '}
          <a href="/login" className="text-white hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
} 