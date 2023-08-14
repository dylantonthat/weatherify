# Weatherify: Spotify-Powered Music Forecasting

This is a simple example of authentication in [Next.js](https://nextjs.org/), using [NextAuth.js](https://next-auth.js.org/) with [Spotify Web](https://developer.spotify.com/documentation/general/guides/authorization/) and [Open Weather Map](https://openweathermap.org/api) APIs.

## Getting Started

Go to the [Spotify for Developers Dashboard](https://developer.spotify.com/dashboard/applications), creating an account if necessary, and create an app.

Create a `.env.local` file at the app root and add the **Client ID** and **Client Secret** as `SPOTIFY_ID` and `SPOTIFY_SECRET`.

Click on **Edit Settings** and add `http://localhost:3000/api/auth/callback/spotify` as a **Redirect URI** to allow local testing, then click save. You will need to add redirect URIs for each deployed application.

Generate a secred with `openssl rand -base64 32` (for example) and add it to `.env.local` as `SECRET`.

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.
