const urlService = require('../services/urlService');
const analyticsService = require('../services/analyticsService');

const RESERVED_PATHS = new Set([
  'login', 'register', 'dashboard', 'analytics', 'admin', 'stats',
  'settings', 'profile', 'health', 'api', 'favicon.ico', 'assets'
]);

class RedirectController {

  /**
   * Resolve shortCode, track analytics, and redirect to target URL
   */
  redirect = async (req, res, next) => {
    try {
      const { shortCode } = req.params;

      // Clean shortCode before checking
      const cleanCode = shortCode.split('?')[0].replace(/^\/|\/$/g, '').toLowerCase();

      // Skip reserved frontend routes — let them fall through to the SPA handler
      if (RESERVED_PATHS.has(cleanCode)) {
        return next();
      }

      // Find URL configuration
      const result = await urlService.findUrlByCode(shortCode);

      if (!result) {
        return res.status(404).send(this.renderErrorPage('Link Not Found', 'The link you are trying to reach does not exist or has been removed.'));
      }

      const { url, isExpired } = result;

      if (isExpired) {
        return res.status(410).send(this.renderErrorPage('Link Expired', 'This shortened link has expired and is no longer active.'));
      }

      if (url.status === 'inactive') {
        return res.status(403).send(this.renderErrorPage('Link Inactive', 'This link is currently inactive or disabled by the owner.'));
      }

      // Extract details for tracking
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const referrerHeader = req.headers['referer'] || req.headers['referrer'];

      // Log visit analytics in background
      analyticsService.recordVisit({
        url,
        ip,
        userAgent,
        referrerHeader
      });

      // Perform HTTP 302 Temporary Redirect
      return res.redirect(302, url.longUrl);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Helper to render custom premium error HTML pages for redirection failures.
   */
  renderErrorPage(title, description) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BK URL Shortener | ${title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Outfit', sans-serif;
            background-color: #09090b;
            color: #fafafa;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
          }
          .container {
            max-width: 440px;
            width: 100%;
            text-align: center;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 40px 32px;
            backdrop-filter: blur(12px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          }
          .logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(to right, #a78bfa, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 24px;
          }
          .icon-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border-radius: 50%;
            margin-bottom: 24px;
          }
          h1 {
            font-size: 1.75rem;
            font-weight: 600;
            color: #f4f4f5;
            margin-bottom: 12px;
          }
          p {
            font-size: 0.95rem;
            color: #a1a1aa;
            line-height: 1.6;
            margin-bottom: 32px;
          }
          .btn {
            display: inline-block;
            width: 100%;
            padding: 12px 24px;
            background: #ffffff;
            color: #09090b;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          .btn:hover {
            background: #e4e4e7;
            transform: translateY(-1px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">BK</div>
          <div class="icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1>${title}</h1>
          <p>${description}</p>
          <a href="/" class="btn">Return to Home</a>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new RedirectController();
