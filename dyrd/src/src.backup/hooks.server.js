/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // Default values for environment variables if not set
  const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || 'https://dryad-restoration.vercel.app';
  const PUBLIC_APP_NAME = process.env.PUBLIC_APP_NAME || 'Dryad Restoration';
  
  // Replace placeholders in the HTML template
  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html
        .replace('%PUBLIC_APP_URL%', PUBLIC_APP_URL)
        .replace('%PUBLIC_APP_NAME%', PUBLIC_APP_NAME);
    }
  });
} 