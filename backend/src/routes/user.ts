import express from 'express';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import { db } from '../index';
import { logger } from '../utils/logger';

const router = express.Router();

// Get user profile
router.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    const { uid } = req.user!;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      throw new AppError('User not found', 404);
    }

    res.json(userDoc.data());
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Error fetching user profile', 500));
  }
});

// Update user profile
router.patch('/profile', async (req: AuthRequest, res, next) => {
  try {
    const { uid } = req.user!;
    const { displayName, photoURL } = req.body;

    await db.collection('users').doc(uid).update({
      displayName,
      photoURL,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(new AppError('Error updating profile', 500));
  }
});

// Get user watchlist
router.get('/watchlist', async (req: AuthRequest, res, next) => {
  try {
    const { uid } = req.user!;
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (!userData?.watchlist) {
      return res.json([]);
    }

    // Get content details for each item in watchlist
    const watchlistContent = await Promise.all(
      userData.watchlist.map(async (contentId: string) => {
        const contentDoc = await db.collection('content').doc(contentId).get();
        return {
          id: contentDoc.id,
          ...contentDoc.data(),
        };
      })
    );

    res.json(watchlistContent);
  } catch (error) {
    next(new AppError('Error fetching watchlist', 500));
  }
});

// Get continue watching
router.get('/continue-watching', async (req: AuthRequest, res, next) => {
  try {
    const { uid } = req.user!;
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (!userData?.continueWatching) {
      return res.json([]);
    }

    // Get content details for each item in continue watching
    const continueWatchingContent = await Promise.all(
      userData.continueWatching.map(async (item: { contentId: string; progress: number }) => {
        const contentDoc = await db.collection('content').doc(item.contentId).get();
        return {
          id: contentDoc.id,
          ...contentDoc.data(),
          progress: item.progress,
        };
      })
    );

    res.json(continueWatchingContent);
  } catch (error) {
    next(new AppError('Error fetching continue watching', 500));
  }
});

// Update subscription plan
router.patch('/subscription', async (req: AuthRequest, res, next) => {
  try {
    const { uid } = req.user!;
    const { plan } = req.body;

    if (!['free', 'basic', 'standard', 'premium'].includes(plan)) {
      throw new AppError('Invalid subscription plan', 400);
    }

    await db.collection('users').doc(uid).update({
      plan,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: 'Subscription plan updated successfully' });
  } catch (error) {
    next(error instanceof AppError ? error : new AppError('Error updating subscription', 500));
  }
});

// Get user preferences
router.get('/preferences', async (req: AuthRequest, res, next) => {
  try {
    const { uid } = req.user!;
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    res.json(userData?.preferences || {});
  } catch (error) {
    next(new AppError('Error fetching preferences', 500));
  }
});

// Update user preferences
router.patch('/preferences', async (req: AuthRequest, res, next) => {
  try {
    const { uid } = req.user!;
    const { preferences } = req.body;

    await db.collection('users').doc(uid).update({
      preferences,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    next(new AppError('Error updating preferences', 500));
  }
});

export default router; 