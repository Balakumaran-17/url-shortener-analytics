require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Url = require('./models/Url');
const Visit = require('./models/Visit');
const { generateQRCode } = require('./utils/qr');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/url-shortener';
const hostBaseUrl = process.env.SERVER_URL || 'http://localhost:5000';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected!');

    // Clear existing data
    console.log('Clearing database collections...');
    await User.deleteMany({});
    await Url.deleteMany({});
    await Visit.deleteMany({});
    console.log('Collections cleared!');

    // Create demo users
    console.log('Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const hashedDemoPassword = await bcrypt.hash('password123', salt);

    const demoUser = await User.create({
      username: 'demouser',
      email: 'demo@example.com',
      password: hashedDemoPassword
    });

    const alternateUser = await User.create({
      username: 'johndoe',
      email: 'john@example.com',
      password: hashedDemoPassword
    });
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedDemoPassword,
      role: 'admin'
    });
    console.log(`Demo users created: ${demoUser.email}, ${alternateUser.email}, ${adminUser.email}`);

    // Create shortened URLs for demouser
    console.log('Creating mock URL entries...');
    const urlsToCreate = [
      {
        longUrl: 'https://github.com/facebook/react',
        shortCode: 'react-repo',
        customAlias: 'react-repo',
        clicks: 145,
        expiresAt: null
      },
      {
        longUrl: 'https://vercel.com/docs/concepts/nextjs/overview',
        shortCode: 'next-docs',
        customAlias: 'next-docs',
        clicks: 89,
        expiresAt: null
      },
      {
        longUrl: 'https://tailwindcss.com/docs/installation',
        shortCode: 'tw-css',
        customAlias: 'tw-css',
        clicks: 212,
        expiresAt: null
      },
      {
        longUrl: 'https://mongodb.com/docs/manual/tutorial/getting-started',
        shortCode: 'mongo-tut',
        customAlias: 'mongo-tut',
        clicks: 42,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
      },
      {
        longUrl: 'https://wikipedia.org/wiki/URL_shortening',
        shortCode: 'wiki-short',
        customAlias: null,
        clicks: 18,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
      }
    ];

    const urls = [];
    for (const urlData of urlsToCreate) {
      const redirectUrl = `${hostBaseUrl}/${urlData.shortCode}`;
      const qrCode = await generateQRCode(redirectUrl);

      const urlDoc = await Url.create({
        userId: demoUser._id,
        longUrl: urlData.longUrl,
        shortCode: urlData.shortCode,
        customAlias: urlData.customAlias,
        clicks: urlData.clicks,
        qrCode,
        status: urlData.expiresAt && urlData.expiresAt < new Date() ? 'expired' : 'active',
        expiresAt: urlData.expiresAt
      });
      urls.push(urlDoc);
    }
    console.log(`Created ${urls.length} URLs for demouser`);

    // Create realistic visits over the last 30 days
    console.log('Generating sample visit analytics data...');
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Chrome Mobile', 'Safari Mobile'];
    const devices = ['Desktop', 'Desktop', 'Mobile', 'Mobile', 'Tablet'];
    const osList = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
    const referrers = ['Direct', 'Google', 'Twitter', 'LinkedIn', 'GitHub', 'Reddit'];
    const geoLocations = [
      { country: 'United States', city: 'San Francisco' },
      { country: 'United States', city: 'New York' },
      { country: 'India', city: 'Bengaluru' },
      { country: 'India', city: 'Mumbai' },
      { country: 'United Kingdom', city: 'London' },
      { country: 'Germany', city: 'Frankfurt' },
      { country: 'Singapore', city: 'Singapore' },
      { country: 'Japan', city: 'Tokyo' }
    ];

    const visitsToCreate = [];

    // Helper to generate random item
    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

    for (const url of urls) {
      const clickCount = url.clicks;
      
      for (let i = 0; i < clickCount; i++) {
        // Distribute visits over the last 30 days
        const visitDate = new Date();
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        
        visitDate.setDate(visitDate.getDate() - daysAgo);
        visitDate.setHours(visitDate.getHours() - hoursAgo);
        visitDate.setMinutes(visitDate.getMinutes() - minutesAgo);

        // Pick correlated user agent details
        const device = randomChoice(devices);
        let browser = randomChoice(browsers);
        let os = randomChoice(osList);

        if (device === 'Mobile') {
          browser = Math.random() > 0.5 ? 'Chrome Mobile' : 'Safari Mobile';
          os = Math.random() > 0.4 ? 'Android' : 'iOS';
        } else {
          // Desktop
          browser = randomChoice(['Chrome', 'Safari', 'Firefox', 'Edge']);
          os = randomChoice(['Windows', 'macOS', 'Linux']);
        }

        const geo = randomChoice(geoLocations);

        visitsToCreate.push({
          urlId: url._id,
          timestamp: visitDate,
          browser,
          device,
          os,
          referrer: randomChoice(referrers),
          country: geo.country,
          city: geo.city,
          createdAt: visitDate,
          updatedAt: visitDate
        });
      }
    }

    // Insert visits in chunks
    console.log(`Inserting ${visitsToCreate.length} visit documents...`);
    await Visit.insertMany(visitsToCreate);
    console.log('Visits data successfully inserted!');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding database failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
