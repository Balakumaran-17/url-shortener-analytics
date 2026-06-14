const QRCode = require('qrcode');

/**
 * Generate base64 Data URL for a QR Code.
 * @param {string} text - The target URL to encode.
 * @returns {Promise<string>} Base64 Data URL.
 */
const generateQRCode = async (text) => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#0f172a', // Slate 900
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('QR Code generation error:', err);
    throw new Error('Failed to generate QR Code');
  }
};

module.exports = {
  generateQRCode
};
