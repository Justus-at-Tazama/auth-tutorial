## Instructions

This code was largely generated with Claude 3.7 from the prompt in the [promt.md](./prompt.md) file.

### Preparation:

Deploy the Tazama Full-Stack in Docker from https://github.com/tazama-lf/Full-Stack-Docker-Tazama

The bare minimum deployment for the Tazama stack is
1. start.bat
2. Option 3. Public (DockerHub)
3. Select option 1. (Authentication)
4. a to accept
5. e to execute

### Authentication Service Tutorial

`git clone https://github.com/Justus-at-Tazama/auth-tutorial.git`

`cd <download-folder>/auth-tutorial`

Update line 33 of the [server.js](./server.js) to point the server to the location of your Tazama authentication service:
`    const response = await fetch('http://your-authentication-service-server:3020/v1/auth/login', {`

`npm install`

`npm start`

Point your browser to `http://localhost:3000/`

Enter username and password to retrieve and display the Tazama token from the Keycloak host via the authentication service API

The contents of the token will enable some additional buttons.

Clicking any button will validate the retrieved Tazama token and claims via the auth-lib's `validateTokenAndClaims()` function.
 - The VALID button submits the token as received - this is expected to be successful.
 - The INACTIVE button is only activated if the claim "DANCE" is contained in the array of claims (it is not, by default)
 - The INVALID button injects a fake claim ('POST_V1_EVALUATE_ISO20022_PAIN_001_001_11_FAKE') into the list of claims and then calls the validation function - this is expected to fail.