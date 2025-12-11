import dbConnect from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fast path: if no token present, avoid DB connection entirely
    const hasToken = Boolean(
      req.headers.authorization?.startsWith('Bearer ') || req.cookies?.token,
    );
    if (!hasToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await dbConnect();
    const user = await verifyToken(req);

    // Prevent caching to ensure fresh user data
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        createdAt: user.createdAt,
        preferences: user.preferences,
        installedApps: user.installedApps || [],
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
