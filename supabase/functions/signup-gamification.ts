// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: corsHeaders
        });
    }

    try {
        const { record } = await req.json();

        // Extract user information from the webhook payload
        const userEmail = record.email;
        const userId = record.id;
        const userName = record.raw_user_meta_data?.display_name || 'Anonymous';

        console.log(`Processing signup for user: ${userEmail} (ID: ${userId})`);

        // Define your app's base URL (ensure this is set in your Edge Function secrets or update manually)
        // Defaulting to production, but you should configure APP_URL in Supabase
        const APP_URL = Deno.env.get('APP_URL') || 'https://idleforest.com';
        const API_ENDPOINT = `${APP_URL}/api/claim-tree/send-email`;

        console.log(`Triggering claim email flow via: ${API_ENDPOINT}`);

        // Call the Next.js API to create the claim and send the email
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Optional: Add a secret header to verify the request comes from this function
                // 'x-webhook-secret': Deno.env.get('WEBHOOK_SECRET') 
            },
            body: JSON.stringify({
                userId: userId,
                email: userEmail,
                userName: userName
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to trigger claim email: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log(`Claim email triggered successfully for ${userEmail}:`, result);

        return new Response(JSON.stringify({
            message: 'Claim email triggered successfully',
            details: result
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (error) {
        console.error('Error processing signup webhook:', error);
        return new Response(JSON.stringify({
            error: error.message
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            status: 500
        });
    }
});
