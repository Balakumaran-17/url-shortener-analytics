const UAParser = require('ua-parser-js');

/**
 * Parse browser, device, and OS from User-Agent header.
 * @param {string} userAgentString - Request User-Agent header.
 * @returns {object} Object containing parsed browser, device, and os.
 */
const parseUserAgent = (userAgentString) => {
  if (!userAgentString) {
    return {
      browser: 'Unknown',
      device: 'Desktop',
      os: 'Unknown'
    };
  }

  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  let browser = result.browser.name || 'Unknown';
  let os = result.os.name || 'Unknown';

  // Map device type
  let device = 'Desktop';
  if (result.device.type === 'mobile') {
    device = 'Mobile';
  } else if (result.device.type === 'tablet') {
    device = 'Tablet';
  } else if (result.device.type === 'smarttv' || result.device.type === 'console' || result.device.type === 'wearable') {
    device = 'Other';
  }

  return {
    browser,
    os,
    device
  };
};

/**
 * Clean and categorize HTTP referrer.
 * @param {string} referrerHeader - HTTP Referer header.
 * @returns {string} Cleaned referrer name.
 */
const parseReferrer = (referrerHeader) => {
  if (!referrerHeader) return 'Direct';
  
  try {
    const url = new URL(referrerHeader);
    let hostname = url.hostname;
    
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    // Map common referrers
    if (hostname.includes('google')) return 'Google';
    if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'Facebook';
    if (hostname.includes('twitter') || hostname.includes('t.co') || hostname.includes('x.com')) return 'Twitter';
    if (hostname.includes('linkedin')) return 'LinkedIn';
    if (hostname.includes('reddit')) return 'Reddit';
    if (hostname.includes('youtube') || hostname.includes('youtu.be')) return 'YouTube';
    if (hostname.includes('github')) return 'GitHub';

    return hostname;
  } catch (err) {
    return 'Direct';
  }
};

module.exports = {
  parseUserAgent,
  parseReferrer
};
