document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const submitBtn = document.getElementById('submitBtn');
  const userIdInput = document.getElementById('userId');
  const passwordInput = document.getElementById('password');
  const responseTextarea = document.getElementById('response');
  const authSection = document.getElementById('authSection');
  const authResult = document.getElementById('authResult');
  const validBtn = document.getElementById('validBtn');
  const inactiveBtn = document.getElementById('inactiveBtn');
  const invalidBtn = document.getElementById('invalidBtn');
  
  // Current token
  let currentToken = null;
  let decodedToken = null;
  
  // Login form submission
  submitBtn.addEventListener('click', async () => {
    const userId = userIdInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!userId || !password) {
      alert('Please enter both user ID and password');
      return;
    }
    
    try {
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';
      responseTextarea.value = 'Authenticating...';
      
      // Send credentials to backend
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });
      
      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }
      
      const data = await response.json();
      currentToken = data.token;
      
      // Decode and display token
      decodedToken = decodeJwt(currentToken);
      responseTextarea.value = JSON.stringify(decodedToken, null, 2);
      
      // Show authentication section
      authSection.classList.remove('hidden');
      
      // Enable/disable buttons based on claims
      const permissions = decodedToken.permissions || 
                         decodedToken.claims || 
                         decodedToken.scope?.split(' ') || 
                         [];
      
      validBtn.disabled = !permissions.includes('POST_V1_EVALUATE_ISO20022_PAIN_001_001_11');
      inactiveBtn.disabled = !permissions.includes('DANCE');
      invalidBtn.disabled = !permissions.includes('POST_V1_EVALUATE_ISO20022_PAIN_001_001_11');
      
      // Reset form state
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
      
    } catch (error) {
      responseTextarea.value = `Error: ${error.message}`;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });
  
  // Valid button click handler
  validBtn.addEventListener('click', async () => {
    try {
      validBtn.disabled = true;
      
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: currentToken,
          buttonType: 'VALID',
          specificClaim: 'POST_V1_EVALUATE_ISO20022_PAIN_001_001_11'
        })
      });
      
      const data = await response.json();
      authResult.value = data.result;
      
      validBtn.disabled = false;
    } catch (error) {
      authResult.value = `Error: ${error.message}`;
      validBtn.disabled = false;
    }
  });
  
  // Inactive button click handler
  inactiveBtn.addEventListener('click', async () => {
    try {
      inactiveBtn.disabled = true;
      
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: currentToken,
          buttonType: 'INACTIVE',
          specificClaim: 'DANCE'
        })
      });
      
      const data = await response.json();
      authResult.value = data.result;
      
      inactiveBtn.disabled = !decodedToken.permissions?.includes('DANCE');
    } catch (error) {
      authResult.value = `Error: ${error.message}`;
      inactiveBtn.disabled = !decodedToken.permissions?.includes('DANCE');
    }
  });
  
  // Invalid button click handler
  invalidBtn.addEventListener('click', async () => {
    try {
      invalidBtn.disabled = true;
      
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: currentToken,
          buttonType: 'INVALID',
          specificClaim: 'POST_V1_EVALUATE_ISO20022_PAIN_001_001_11_FAKE'
        })
      });
      
      const data = await response.json();
      authResult.value = data.result;
      
      invalidBtn.disabled = false;
    } catch (error) {
      authResult.value = `Error: ${error.message}`;
      invalidBtn.disabled = false;
    }
  });
  
  // Function to decode JWT token
  function decodeJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return { error: 'Invalid token format' };
    }
  }
});