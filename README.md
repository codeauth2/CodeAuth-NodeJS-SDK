# CodeAuth Node.js SDK
[![Version](https://img.shields.io/npm/v/codeauth-sdk)](https://www.npmjs.org/package/codeauth-sdk)
[![Downloads](https://img.shields.io/npm/dm/codeauth-sdk)](https://www.npmjs.com/package/codeauth-sdk)

Offical CodeAuth SDK. For more info, check the docs on our [official website](https://docs.codeauth.com).

## Installation
Install the package with:

```
npm install codeauth-sdk
```

## Basic Usage

### Initialize CodeAuth SDK
```javascript
const CodeAuth = require('codeauth-sdk');
CodeAuth.Initialize("<your project API endpoint>", "<your project ID>")
```

### Signin / Email
Begins the sign in or register flow by sending the user a one time code via email.
```javascript
var result = await CodeAuth.SignInEmail("<user email>")
switch (result.error)
{
	case "bad_json": break;
	case "project_not_found": break;
	case "bad_ip_address": break;
	case "rate_limit_reached": break;
	case "bad_email": break;
	case "code_request_interval_reached": break;
	case "code_hourly_limit_reached": break;
	case "email_provider_error": break;
	case "internal_error": break;
	case "connection_error": break; // sdk failed to connect to api server
}
console.log(result)
```

### Signin / Email Verify
Checks if the one time code matches in order to create a session token.
```javascript
var result = await CodeAuth.SignInEmailVerify("<user email>", "<one time code>")
switch (result.error)
{
	case "bad_json": break;
	case "project_not_found": break;
	case "bad_ip_address": break;
	case "rate_limit_reached": break;
	case "bad_email": break;
	case "bad_code": break;
	case "internal_error": break;
	case "connection_error": break; // sdk failed to connect to api server
}
console.log(result);
```

### Signin / Social
Begins the sign in or register flow by allowing users to sign in through a social OAuth2 link.
```javascript
var result = await CodeAuth.SignInSocial("<social_type>")
switch (result.error)
{
	case "bad_json": break;
	case "project_not_found": break;
	case "bad_ip_address": break;
	case "rate_limit_reached": break;
	case "bad_social_type": break;
	case "internal_error": break;
	case "connection_error": break; // sdk failed to connect to api server
}
console.log(result);
```

### Signin / Social Verify
This is the next step after the user signs in with their social account. This request checks the authorization code given by the social media company in order to create a session token.
```javascript
var result = await CodeAuth.SignInSocialVerify("<social type>", "<code>")
switch (result.error)
{
	case "bad_json": break;
	case "project_not_found": break;
	case "bad_ip_address": break;
	case "rate_limit_reached": break;
	case "bad_social_type": break;
	case "bad_code": break;
	case "internal_error": break;
	case "connection_error": break; // sdk failed to connect to api server
}
console.log(result);
```

### Session / Info
Gets the information associated with a session token.
```javascript
var result = await CodeAuth.SessionInfo("<session_token>")
switch (result.error)
{
	case "bad_json": break;
	case "project_not_found": break;
	case "bad_ip_address": break;
	case "rate_limit_reached": break;
	case "bad_session_token": break;
	case "internal_error": break;
	case "connection_error": break; // sdk failed to connect to api server
}
console.log(result)
```

### Session / Refresh
Create a new session token using existing session token.
```javascript
var result = await CodeAuth.SessionRefresh("<session_token>")
switch (result.error)
{
	case "bad_json": break;
	case "project_not_found": break;
	case "bad_ip_address": break;
	case "rate_limit_reached": break;
	case "bad_session_token": break;
	case "out_of_refresh": break;
	case "internal_error": break;
	case "connection_error": break; // sdk failed to connect to api server
}
console.log(result)
```

### Session / Invalidate
Invalidate a session token. By doing so, the session token can no longer be used for any api call.
```javascript
var result = await CodeAuth.SessionInvalidate("<session_token>", "<invalidate_type>")
switch (result.error)
{
	case "bad_json": break;
	case "project_not_found": break;
	case "bad_ip_address": break;
	case "rate_limit_reached": break;
	case "bad_session_token": break;
	case "bad_invalidate_type": break;
	case "internal_error": break;
	case "connection_error": break; // sdk failed to connect to api server 
}
console.log(result)
```

