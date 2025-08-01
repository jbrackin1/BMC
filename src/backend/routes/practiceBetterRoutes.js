// routes/practiceBetter.js
require('dotenv').config({
  path: require('path').resolve(__dirname, '../../../.env')
});
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');



router.get('/lab-requests', async (req, res) => {
  try {
    console.log('🔑 Requesting Practice Better token...');

    const tokenRes = await fetch('https://api.practicebetter.io/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.PB_CLIENT_ID,
        client_secret: process.env.PB_CLIENT_SECRET,
        scope: 'read',
      }),
    });

    const rawText = await tokenRes.text();

    if (!tokenRes.ok) {
      throw new Error(`Token fetch failed: ${tokenRes.status} - ${rawText}`);
    }

    const tokenData = JSON.parse(rawText);
    const accessToken = tokenData.access_token;

    console.log('✅ Got PB token:', accessToken ? 'Yes' : 'No');

    // Now call the lab requests endpoint
    const labRes = await fetch('https://api.practicebetter.io/consultant/labrequests', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const labText = await labRes.text();
    console.log('📦 Lab response:', labText);

    if (!labRes.ok) {
      throw new Error(`Lab fetch failed: ${labRes.status} - ${labText}`);
    }

    const labData = JSON.parse(labText);
    res.json(labData);
  } catch (err) {
    console.error('❌ Practice Better fetch failed:', err.stack || err);
    res.status(500).json({ error: 'Failed to fetch lab requests' });
  }
});

module.exports = router;