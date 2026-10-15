import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'shopkart_jwt_secret_dev_key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  // Set both 'token' and 'jwt' cookie names for maximum lab & client compatibility
  res.cookie('token', token, cookieOptions);
  res.cookie('jwt', token, cookieOptions);

  return token;
};

export const clearAuthCookie = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };
  res.clearCookie('token', cookieOptions);
  res.clearCookie('jwt', cookieOptions);
};

export default generateTokenAndSetCookie;
