const axios = require('axios');
require('dotenv').config();

let accessToken = null;

// Function to fetch tokens using authorization code
const fetchTokens = async (authCode) => {
  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.ZOHO_REDIRECT_URI,
        grant_type: 'authorization_code',
        code: authCode, // Pass the authorization code dynamically
      },
    });

    console.log('Tokens:', response.data);
    console.log('Access Token:', response.data.access_token);
    console.log('Refresh Token:', response.data.refresh_token);

    // Return the tokens for use
    return response.data;
  } catch (error) {
    console.error('Error fetching tokens:', error.response?.data || error.message);
    throw new Error('Failed to fetch tokens using authorization code');
  }
};

// Function to fetch access token using refresh token
const getAccessToken = async () => {
  if (accessToken) return accessToken;

  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      },
    });

    accessToken = response.data.access_token;

    // Handle token expiration (default: 1 hour)
    setTimeout(() => {
      accessToken = null;
    }, (response.data.expires_in || 3600) * 1000);

    console.log('Access token refreshed successfully');
    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error.response?.data || error.message);
    throw new Error('Unable to fetch access token');
  }
};

// Function to send email dynamically
const sendEmail = async (from, to, subject, content) => {
  const token = await getAccessToken(); // Fetch the current access token

  try {
    const response = await axios.post(
      `https://mail.zoho.com/api/accounts/${process.env.ZOHO_EMAIL_ADDRESS}/messages`, // Use Zoho email address/account ID from .env
      {
        fromAddress: from, // Sender's email address
        toAddress: to,     // Recipient's email address
        subject: subject,  // Subject of the email
        content: content,  // Email content (HTML or plain text)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Authorization header with Bearer token
        },
      }
    );

    console.log('Email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error.response?.data || error.message);
    throw new Error('Failed to send email');
  }
};

// Function to list emails (fetch emails from Zoho Mail)
const listEmails = async () => {
  const token = await getAccessToken(); // Get the access token

  try {
    const response = await axios.get(
      `https://mail.zoho.com/api/accounts/${process.env.ZOHO_EMAIL_ADDRESS}/messages`, // Use Zoho email address/account ID
      {
        headers: {
          Authorization: `Bearer ${token}`, // Authorization header with Bearer token
        },
      }
    );

    console.log('Emails fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error listing emails:', error.response?.data || error.message);
    throw new Error('Failed to fetch emails');
  }
};

// Example usage of `fetchTokens`
// This should be called once you get the authorization code after the user logs in via the Zoho OAuth consent screen.
(async () => {
  try {
    const authCode = '<AUTHORIZATION_CODE>'; // Replace this with the actual authorization code
    const tokens = await fetchTokens(authCode); // Call the function to fetch tokens
    console.log('Fetched Tokens:', tokens);
  } catch (error) {
    console.error('Error in token fetch process:', error.message);
  }
})();

// Export functions for external use
module.exports = { fetchTokens, getAccessToken, sendEmail, listEmails };
