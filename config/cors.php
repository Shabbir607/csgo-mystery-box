<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Paths
    |--------------------------------------------------------------------------
    | These are the endpoints that should allow cross-origin requests.
    | Make sure sanctum/csrf-cookie is included so that CSRF tokens
    | can be initialized from your frontend (Next.js).
    */
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
    ],

    /*
    |--------------------------------------------------------------------------
    | Allowed Methods
    |--------------------------------------------------------------------------
    | Allow all methods (GET, POST, PUT, DELETE, OPTIONS, etc.)
    */
    'allowed_methods' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins
    |--------------------------------------------------------------------------
    | ⚠️ DO NOT use '*' when supports_credentials = true.
    | You must explicitly define your frontend domains here.
    */
    'allowed_origins' => [
        'http://localhost:3000'        
      
    ],

    'allowed_origins_patterns' => [],

    /*
    |--------------------------------------------------------------------------
    | Allowed Headers
    |--------------------------------------------------------------------------
    | Allow all headers
    */
    'allowed_headers' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Exposed Headers
    |--------------------------------------------------------------------------
    | Usually empty unless you want to expose custom headers to the frontend
    */
    'exposed_headers' => [],

    /*
    |--------------------------------------------------------------------------
    | Max Age
    |--------------------------------------------------------------------------
    | How long results of a preflight request (OPTIONS) can be cached
    */
    'max_age' => 0,

    /*
    |--------------------------------------------------------------------------
    | Supports Credentials
    |--------------------------------------------------------------------------
    | MUST be true for Sanctum cookie-based authentication to work.
    | Ensures cookies are sent cross-site.
    */
    'supports_credentials' => true,

];
