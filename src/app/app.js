/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */


const SpotifyWebApi = require("spotify-web-api-node");

const spotifyAuthAPI = new SpotifyWebApi({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: process.env.REDIRECT_URI,
});

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());


//login method using spotify web api wrapper
app.get("/login", (req, res) => {
  const generateRandomString = (length) => {
    let text = "";
    let possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const stateString = generateRandomString(16);
  res.cookie("authState", stateString);

  const scopes = ["user-top-read"];
  const loginLink = spotifyAuthAPI.createAuthorizeURL(scopes, stateString);
  res.redirect(loginLink);
});

app.get("/callback", (req, res) => {
  if (req.query.state !== req.cookies["authState"]) {
    // States don't match, send the user away.
    return res.redirect("/");
  }

  return res.status(200).send("placeholder for the bright future");
});

const accTknRefreshments = (req, res, next) => {
  if (req.cookies["accTkn"]) return next();
  else if (req.cookies["refTkn"]) {
    spotifyAuthAPI.setRefreshToken(refresh_token);
    spotifyAuthAPI.refreshAccessToken().then((data) => {
      spotifyAuthAPI.resetRefreshToken();

      const newAccTok = data.body["access_token"];
      res.cookie("accTkn", newAccTok, {
        maxAge: data.body["expires_in"] * 1000,
      });

      return next();
    });
  } else {
    return res.redirect("/login");
  }
};

app.get("/faves", accTknRefreshments, (req, res) => {
  const spotifyAPI = new SpotifyWebApi({ accessToken: req.cookies["accTkn"] });

  // query Spotify's top tracks endpoint for a user API, with a max track count of count and time range
  // extended over the user's entire account
  count = 12;
  spotifyAPI
    .getMyTopTracks({ limit: count, time_range: "long_term" })
    .then((data) => {
      return res
        .status(200)
        .send(`<pre>${JSON.stringify(data.body.items, null, 2)}</pre>`);
    });
});
