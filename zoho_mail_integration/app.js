const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 5000;

// Route to handle the callback from Zoho
app.get('/callback', async (req, res) => {
  const authorizationCode = req.query.code;

  if (!authorizationCode) {
    return res.status(400).send('Authorization code is missing.');
  }

  try {
    // Exchange authorization code for access and refresh tokens
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: 'http://localhost:5000/callback',  // Must match the redirect URI you used during OAuth setup
        code: authorizationCode,
      },
    });

    const { access_token, refresh_token } = response.data;

    // Store the tokens securely (e.g., in a database or environment variables)
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);

    res.send('Tokens received successfully! You can now use the API.');
  } catch (error) {
    console.error('Error exchanging authorization code:', error.response?.data || error.message);
    res.status(500).send('Error exchanging authorization code.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
