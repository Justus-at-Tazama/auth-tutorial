I would like to create a small web application with a front-end and a back-end.
The front-end must be a web page with the following components:
 - A user ID field and label
 - A password field and label
 - A "submit" button
 - A response text box and label

The back-end must use the functionality available in the https://github.com/tazama-lf/auth-lib library. The library is available as an npm package hosted in the GitHub package registry.

When the user enters a valid ID and password and clicks submit in the front end, the back-end application must POST these credentials to an authentication service hosted at http://juice.chknhdnordvpn-everest.nord:3020/v1/auth/login to retrieve a JWT token.

The front-end must then decode the JWT token and display the contents of the token in the response text box. The available claims for the user are listed in the claims array.

The front-end application must then display an "Authentication" text field and label.

The public key for the validation of a token is in the test-public-key.pem file. The public key path must be stored in the process.env.CERT_PATH_PUBLIC environment variable.

The front-end application must then display three additional buttons on the web page when the JWT token is received:
 - The first button must be labeled "VALID". If the decoded token's claim array contains a claim called "POST_V1_EVALUATE_ISO20022_PAIN_001_001_11" the button must be enabled. If the user clicks this button, the back-end application must invoke the auth-lib library's validateTokenAndClaims() function with the token and list of claims, and if the auth-lib's response indicates that the token and claims are valid, the back-end must check if the "POST_V1_EVALUATE_ISO20022_PAIN_001_001_11" claim is in the array of claims and report successful authorization to . Update the Authentication text field with the output of the function.
 - The second button must be labelled "INACTIVE". If the decoded token contains a claim called "DANCE" the button must be enabled, otherwise the button must be disabled. If the button is enabled and a user clicks this button, the back-end application must invoke the auth-lib library's validateTokenAndClaims() function with the "DANCE" claim. Update the Authentication text field with the output of the function.
 - The third button must be labeled "INVALID". If the decoded token's claim array contains a claim called "POST_V1_EVALUATE_ISO20022_PAIN_001_001_11" the button must be enabled, otherwise the button must be disabled. If the user clicks this button, the front-end application must add a "POST_V1_EVALUATE_ISO20022_PAIN_001_001_11_FAKE" to the array of claims and then the back-end application must invoke the auth-lib library's validateTokenAndClaims() function with the updated list of claims. Update the Authentication text field with the output of the function.

 Sequence Diagram

 ```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant AuthService as Authentication Service
    participant AuthLib as @tazama-lf/auth-lib

    Note over Backend: Set CERT_PATH_PUBLIC environment variable
    Note over Backend: Load AuthLib with public key path

    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/login with credentials
    Backend->>AuthService: POST to auth service endpoint
    AuthService-->>Backend: Return JWT token
    Backend-->>Frontend: Return token
    Frontend->>Frontend: Decode and display token
    Frontend->>Frontend: Enable/disable buttons based on claims

    alt User clicks VALID button
        User->>Frontend: Click VALID button
        Frontend->>Backend: POST /api/validate with token and VALID button type
        Backend->>Backend: Decode token to get claims
        Backend->>AuthLib: validateTokenAndClaims(token, claims)
        AuthLib-->>Backend: Validation result
        Backend->>Backend: Check if specific claim exists
        Backend-->>Frontend: Return validation result
        Frontend->>Frontend: Display result in Authentication field
    else User clicks INACTIVE button
        User->>Frontend: Click INACTIVE button
        Frontend->>Backend: POST /api/validate with token and INACTIVE button type
        Backend->>Backend: Decode token to get claims
        Backend->>AuthLib: validateTokenAndClaims(token, claims)
        AuthLib-->>Backend: Validation result
        Backend->>Backend: Check if DANCE claim exists
        Backend-->>Frontend: Return validation result
        Frontend->>Frontend: Display result in Authentication field
    else User clicks INVALID button
        User->>Frontend: Click INVALID button
        Frontend->>Backend: POST /api/validate with token and INVALID button type
        Backend->>Backend: Decode token to get claims
        Backend->>Backend: Add fake claim to claims list
        Backend->>AuthLib: validateTokenAndClaims(token, modified claims)
        AuthLib-->>Backend: Validation error
        Backend-->>Frontend: Return validation error
        Frontend->>Frontend: Display error in Authentication field
    end
```