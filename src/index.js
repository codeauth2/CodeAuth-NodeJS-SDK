const https = require('https')

class CodeAuth {
    static #Endpoint; static #ProjectID; 
    static #UseCache; static #CacheDuration; static #CacheSession; static #CacheExpiration;
    static #HasInitialized;

    /**
     * @summary Initialize the CodeAuth SDK
     * @param {string} project_endpoint - The endpoint of your project. This can be found inside your project settings.
     * @param {string} project_id - Your project ID. This can be found inside your project settings.
     * @param {string} use_cache - Whether to use cache or not. Using cache can help speed up response time and mitigate some rate limits. This will automatically cache new session token (from '/signin/emailverify', 'signin/socialverify', 'session/info', 'session/refresh') and automatically delete cache when it is invalidated (from 'session/refresh', 'session/invalidate').
     * @param {string} cache_duration - How long the cache should last. At least 15 seconds required to effectively mitigate most rate limits. Check docs for more info.
     */
    static Initialize(project_endpoint, project_id, use_cache = true, cache_duration = 30) 
    {
        if (this.#HasInitialized) throw new Error('CodeAuth has already been Initialized.');
        this.#HasInitialized = true;

        this.#Endpoint = project_endpoint;
        this.#ProjectID = project_id;
        this.#UseCache = use_cache;
        this.#CacheDuration = cache_duration * 1000;
        this.#CacheSession = new Map();
        this.#CacheExpiration = Date.now() + this.#CacheDuration;
    }
    
    // -------
    // Makes sure cache hasn't expired, if it did, delete the whole map
    // -------
    static #EnsureCache() 
    {
        // make sure caching is enabled
        if (!this.#UseCache) return;

        // delete cache if cache expired
        if (this.#CacheExpiration < Date.now())
        {
            this.#CacheExpiration = Date.now() + this.#CacheDuration; // set next expiration time
            this.#CacheSession.clear();
        }
    }

    // -------
    // Makes sure that the CodeAuth SDK has been initialized
    // -------
    static #EnsureInitialized() {
        if (!this.#HasInitialized) throw new Error('CodeAuth has not been initialized.');
    }

    // -------
    // Create api request and call server
    // -------
    static #CallApiRequest(path, body) {
        return new Promise((resolve) => {
            // exception mitigation
            try
            {
                // get url info
                const parsed = new URL(`https://${this.#Endpoint}` + path);

                // convert object to json string
                const dataString = JSON.stringify(body);

                // create http optioin
                const options = {
                    hostname: parsed.hostname,
                    port: parsed.port || 443,
                    path: parsed.pathname + parsed.search,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength(dataString)
                    }
                };

                // call http
                const req = https.request(options, (res) => {
                    let data = "";

                    res.on("data", chunk => data += chunk);
                    res.on("end", () => {
                        try 
                        { 
                            var json = JSON.parse(data);
                            if (res.statusCode == 200) json.error = "no_error"; // set .error json to 'no_error' for OK (200) response
                            resolve(json);
                        } catch { resolve({ error: "connection_error" }); }
                    });
                });

                // handle error
                req.on("error", (e) => resolve({ error: "connection_error" }));

                req.write(dataString);
                req.end();
            }
            catch { resolve({ error: "connection_error" }) }
        });
    }




    /**
     * @summary Begins the sign in or register flow by sending the user a one time code via email.
     * @param {string} email - The email of the user you are trying to sign in/up. Email must be between 1 and 64 characters long. The email must also only contain letter, number, dot (not first, last, or consecutive), underscore(not first or last) and/or hyphen(not first or last).
     * @returns A success response will return error = 'no_error'
     */
    static async SignInEmail(email) 
    {
        // make sure CodeAuth SDK has been initialized
        this.#EnsureInitialized();

        // make sure cache if valid
        this.#EnsureCache();

        // return signin email 
        return await this.#CallApiRequest(
            `/signin/email`, 
            {
                project_id: this.#ProjectID,
                email: email,
            }
        );
    }

    /**
     * @summary Checks if the one time code matches in order to create a session token.
     * @param {string} email - The email of the user you are trying to sign in/up. Email must be between 1 and 64 characters long. The email must also only contain letter, number, dot (not first, last, or consecutive), underscore(not first or last) and/or hyphen(not first or last).
     * @param {string} code - The one time code that was sent to the email.
     * @returns {object} { session_token, email, expiration, refresh_left } 
     */
    static async SignInEmailVerify(email, code) 
    {
        // make sure CodeAuth SDK has been initialized
        this.#EnsureInitialized();

        // make sure cache if valid
        this.#EnsureCache();

        // call server and get response 
        var result = await this.#CallApiRequest(
            `/signin/emailverify`, 
            {
                project_id: this.#ProjectID,
                email: email,
                code: code
            }
        );
        
        // save to cache if enabled
        if (this.#UseCache && result.error == "no_error") 
            this.#CacheSession.set(result.session_token, result);

        // return signin email verify
        return result;
    }

    /**
     * @summary Begins the sign in or register flow by allowing users to sign in through a social OAuth2 link.
     * @param {string} social_type - The type of social OAuth2 url you are trying to create. Possible social types: "google", "microsoft", "apple"
     * @returns {object} { signin_url }
     */
    static async SignInSocial(social_type) 
    {
        // make sure CodeAuth SDK has been initialized
        this.#EnsureInitialized();

        // make sure cache if valid
        this.#EnsureCache();

        // return signin social 
        return await this.#CallApiRequest(
            `/signin/social`, 
            {
                project_id: this.#ProjectID,
                social_type: social_type
            }
        );
    }

    /**
     * @summary This is the next step after the user signs in with their social account. This request checks the authorization code given by the social media company in order to create a session token.
     * @param {string} social_type - The type of social OAuth2 url you are trying to verify. Possible social types: "google", "microsoft", "apple"
     * @param {string} authorization_code - The authorization code given by the social. Check the docs for more info.
     * @returns {object} { session_token, email, expiration, refresh_left }
     */
    static async SignInSocialVerify(social_type, authorization_code) 
    {
        // make sure CodeAuth SDK has been initialized
        this.#EnsureInitialized();

        // make sure cache if valid
        this.#EnsureCache();

        // call server and get response 
        var result = await this.#CallApiRequest(
            `/signin/socialverify`, 
            {
                project_id: this.#ProjectID,
                social_type: social_type,
                authorization_code: authorization_code
            }
        );

        // save to cache if enabled
        if (this.#UseCache && result.error == "no_error") 
            this.#CacheSession.set(result.session_token, result);

        // return signin social verify
        return result;
    }

    /**
     * @summary Gets the information associated with a session token.
     * @param {string} session_token - The session token you are trying to get information on.
     * @returns {object} { email, expiration, refresh_left }
     */
    static async SessionInfo(session_token) 
    {
        // make sure CodeAuth SDK has been initialized
        this.#EnsureInitialized();

        // make sure cache if valid
        this.#EnsureCache();

        // return the cached info if it is enabled, not expired and exist
        if (this.#UseCache && this.#CacheExpiration > Date.now())
        {
            var cache = this.#CacheSession.get(session_token);
            if (cache) 
            {
                console.log("used cache");
                return cache;
            }
        }

        // call request
        var result = await this.#CallApiRequest(
            `/session/info`, 
            {
                project_id: this.#ProjectID,
                session_token: session_token
            }
        );

        // save to cache if enabled
        if (this.#UseCache && result.error == "no_error") 
            this.#CacheSession.set(session_token, result);

        // return session info
        return result;
    }

    /**
     * @summary Create a new session token using existing session token.
     * @param {string} session_token - The session token you are trying to use to create a new token.
     * @returns {object} { session_token:<string>, email:<string>, expiration:<int>, refresh_left:<int> }
     */
    static async SessionRefresh(session_token) 
    {        
        // make sure CodeAuth SDK has been initialized
        this.#EnsureInitialized();

        // make sure cache if valid
        this.#EnsureCache();

        // call server and get response 
        var result = await this.#CallApiRequest(
            `/session/refresh`, 
            {
                project_id: this.#ProjectID,
                session_token: session_token
            }
        );

        // if cache is enabled, delete old session token cache and set the new one
        if (this.#UseCache && result.error == "no_error") 
        {
            this.#CacheSession.delete(session_token, result);
            this.#CacheSession.set(result.session_token, result);
        }

        // return
        return result;
    }

    /**
     * @summary Invalidate a session token. By doing so, the session token can no longer be used for any api call.
     * @param {string} session_token - The session token you are trying to use to invalidate.
     * @param {string} invalidate_type - How to use the session token to invalidate. Possible invalidate types: 'only_this', 'all', 'all_but_this'
     * @returns {object} {}
     */
    static async SessionInvalidate(session_token, invalidate_type) 
    {
        // make sure CodeAuth SDK has been initialized
        this.#EnsureInitialized();
        
        // make sure cache if valid
        this.#EnsureCache();

        // call server and get response 
        var result = await this.#CallApiRequest(
            `/session/invalidate`, 
            {
                project_id: this.#ProjectID,
                session_token: session_token,
                invalidate_type: invalidate_type
            }
        );

        // if cache is enabled, and there is no problem with the request, delete the session token cache
        if (this.#UseCache && result.error == "no_error") 
        {
            this.#CacheSession.delete(session_token, result);
        }

        // return
        return result;
    }
}

module.exports = CodeAuth
