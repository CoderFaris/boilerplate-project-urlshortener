require('dotenv').config();
const bodyParser = require('body-parser')
const express = require('express');
const cors = require('cors');
const URL = require("url").URL;
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlDatabase = {};  // short_url -> original_url
let reverseDatabase = {};  // original_url -> short_url
let idCounter = 1;

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    if (reverseDatabase[originalUrl]) {
      const shortUrl = reverseDatabase[originalUrl];
      res.json({ original_url: originalUrl, short_url: shortUrl });
    } else {
      const shortUrl = idCounter++;

      urlDatabase[shortUrl] = originalUrl;
      reverseDatabase[originalUrl] = shortUrl;

      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'no short url found' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
