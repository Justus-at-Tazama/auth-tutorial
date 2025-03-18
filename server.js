const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');

// Set the environment variable for the auth-lib certificate path
// This must be set BEFORE requiring the auth-lib
const publicKeyPath = path.join(__dirname, 'test-public-key.pem');
process.env.CERT_PATH_PUBLIC = publicKeyPath;

// Now load the auth-lib
const { validateTokenAndClaims } = require('@tazama-lf/auth-lib');

const app = express();
const PORT = process.env.PORT || 3000;

// Verify public key exists
if (!fs.existsSync(publicKeyPath)) {
  console.error('Warning: Public key file not found at', publicKeyPath);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    // Call authentication service
    const response = await fetch('http://juice.chknhdnordvpn-everest.nord:3020/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: userId, password })
    });

    if (!response.ok) {
      throw new Error(`Auth service returned ${response.status}: ${response.statusText}`);
    }

    // First get the response as text
    const responseText = await response.text();
    let token;
    
    // Try to parse as JSON first
    try {
      const data = JSON.parse(responseText);
      token = data.access_token || data.token || data;
      console.log('Token received as JSON');
    } catch (e) {
      // If not JSON, use the raw text as the token
      token = responseText;
      console.log('Token received as raw string');
    }
    
    res.json({ token });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Validate token and claims endpoint
app.post('/api/validate', async (req, res) => {
  try {
    const { token, buttonType, specificClaim } = req.body;
    
    // Decode token to get claims for validation
    let decodedToken;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');
      
      const payload = Buffer.from(parts[1], 'base64').toString();
      decodedToken = JSON.parse(payload);
    } catch (error) {
      return res.status(400).json({ result: 'Invalid token format' });
    }
    
    // Get all claims from token
    const claims = decodedToken.claims || [];
        
    let result;
    
    try {
      if (buttonType === 'INVALID') {
        // For INVALID button, add a fake claim that doesn't exist
        const modifiedClaims = [...claims, 'POST_V1_EVALUATE_ISO20022_PAIN_001_001_11_FAKE'];
        // This should fail validation
        await validateTokenAndClaims(token, modifiedClaims);
        // If we get here, validation unexpectedly succeeded
        result = "Unexpected validation success with fake claim";
      } else {
        // For VALID and INACTIVE buttons, validate the token with its original claims
        await validateTokenAndClaims(token, claims);
        
        // Now check for the specific claim
        if (claims.includes(specificClaim)) {
          result = `Valid token and claim "${specificClaim}" is present`;
        } else {
          result = `Valid token but claim "${specificClaim}" is not present`;
        }
      }
    } catch (error) {
      // Validation failed
      result = `Validation failed: ${error.message}`;
    }
    
    res.json({ result });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(400).json({ result: `Error: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using public key at: ${publicKeyPath}`);
});