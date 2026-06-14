const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    browser: {
      type: String,
      default: 'Unknown'
    },
    device: {
      type: String,
      default: 'Desktop'
    },
    os: {
      type: String,
      default: 'Unknown'
    },
    referrer: {
      type: String,
      default: 'Direct'
    },
    country: {
      type: String,
      default: 'Unknown'
    },
    city: {
      type: String,
      default: 'Unknown'
    }
  },
  {
    timestamps: true
  }
);

// Compound index for aggregating clicks over time for a specific URL
VisitSchema.index({ urlId: 1, timestamp: -1 });

// Compound indexes for individual dimension aggregations
VisitSchema.index({ urlId: 1, browser: 1 });
VisitSchema.index({ urlId: 1, device: 1 });
VisitSchema.index({ urlId: 1, os: 1 });
VisitSchema.index({ urlId: 1, referrer: 1 });
VisitSchema.index({ urlId: 1, country: 1 });
VisitSchema.index({ urlId: 1, city: 1 });

module.exports = mongoose.model('Visit', VisitSchema);
