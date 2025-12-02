import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'

// Normalize NEXTAUTH_URL: replace localhost with 127.0.0.1 for Spotify compatibility
// Spotify no longer allows 'localhost' in redirect URIs - must use explicit IP
const normalizeUrl = (url: string | undefined): string => {
  if (!url) return 'http://127.0.0.1:3000'
  return url.replace(/localhost/g, '127.0.0.1').replace(/\/$/, '')
}

const baseUrl = normalizeUrl(process.env.NEXTAUTH_URL)

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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
  },
})
