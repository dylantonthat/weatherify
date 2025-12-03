import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'

// Normalize NEXTAUTH_URL: replace localhost with 127.0.0.1 for Spotify compatibility (dev only)
// Spotify no longer allows 'localhost' in redirect URIs - must use explicit IP for local dev
// For production (Vercel), use the URL as-is (must be HTTPS)
const normalizeUrl = (url: string | undefined): string => {
  if (!url) {
    // Default to localhost for development
    return process.env.NODE_ENV === 'production' 
      ? '' // Vercel will set this automatically via NEXTAUTH_URL env var
      : 'http://127.0.0.1:3000'
  }
  // Only normalize localhost for development
  if (url.includes('localhost')) {
    return url.replace(/localhost/g, '127.0.0.1').replace(/\/$/, '')
  }
  // For production URLs, just remove trailing slash
  return url.replace(/\/$/, '')
}

const baseUrl = normalizeUrl(process.env.NEXTAUTH_URL)

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: any) {
  try {
    const url =
      "https://accounts.spotify.com/api/token?" +
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      })

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_ID + ":" + process.env.SPOTIFY_SECRET
          ).toString("base64"),
      },
      method: "POST",
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.error("Error refreshing access token", error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

// Debug: Log environment variables (without exposing secrets)
if (typeof window === 'undefined') {
  console.log('NextAuth Config Check:')
  console.log('SPOTIFY_ID exists:', !!process.env.SPOTIFY_ID)
  console.log('SPOTIFY_SECRET exists:', !!process.env.SPOTIFY_SECRET)
  console.log('SECRET exists:', !!process.env.SECRET)
  console.log('Original NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'NOT SET')
  console.log('Normalized base URL:', baseUrl)
  console.log('Expected redirect URI:', `${baseUrl}/api/auth/callback/spotify`)
}

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_ID!,
      clientSecret: process.env.SPOTIFY_SECRET!,
      authorization: {
        params: {
          scope: 'user-read-email user-top-read user-read-private',
        },
      },
    }),
  ],
  secret: process.env.SECRET,
  pages: {
    signIn: '/',
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000, // Default to 1 hour
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && typeof token.accessTokenExpires === 'number' && Date.now() < token.accessTokenExpires) {
        return token
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
  },
})
