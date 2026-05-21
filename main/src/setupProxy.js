const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/melhor-envio',
    createProxyMiddleware({
      target: 'https://sandbox.melhorenvio.com.br',
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/melhor-envio': '/api/v2/me' },
      logLevel: 'debug',
      onProxyReq: (proxyReq, req) => {
        const token = process.env.REACT_APP_MELHOR_ENVIO_TOKEN
        if (token) proxyReq.setHeader('Authorization', `Bearer ${token}`)
        proxyReq.setHeader('User-Agent', 'Music Store (contato@musicstore.local)')
        proxyReq.setHeader('Accept', 'application/json')
        console.log('[melhor-envio proxy]', req.method, req.originalUrl, '->', proxyReq.path)
      },
      onProxyRes: (proxyRes, req) => {
        console.log('[melhor-envio proxy] response', proxyRes.statusCode, 'for', req.originalUrl)
        if (proxyRes.statusCode >= 400) {
          let body = ''
          proxyRes.on('data', (chunk) => { body += chunk })
          proxyRes.on('end', () => {
            console.log('[melhor-envio proxy] error body:', body)
          })
        }
      },
    })
  )
}
