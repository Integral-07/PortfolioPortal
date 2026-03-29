export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  url.host = 'portfolio-portal-api.tk-cloudflare-817.workers.dev'
  url.protocol = 'https:'

  return fetch(url.toString(), request)
}
