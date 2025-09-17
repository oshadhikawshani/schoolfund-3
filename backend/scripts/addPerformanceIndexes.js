// Performance optimization indexes for faster donor dashboard loading
const mongoose = require('mongoose');
require('dotenv').config();

async function createIndexSafely(collection, indexSpec, options = {}) {
  try {
    await collection.createIndex(indexSpec, options);
    console.log(`  ✓ Created index ${options.name || JSON.stringify(indexSpec)}`);
  } catch (error) {
    if (error.code === 86) { // IndexKeySpecsConflict
      console.log(`  - Index ${options.name || JSON.stringify(indexSpec)} already exists`);
    } else {
      console.error(`  ✗ Failed to create index ${options.name}:`, error.message);
    }
  }
}

async function addPerformanceIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connected to MongoDB. Adding performance indexes...');

    const db = mongoose.connection.db;

    // Index for MonetaryDonation collection
    console.log('Adding indexes to monetarydonations collection...');
    await createIndexSafely(
      db.collection('monetarydonations'),
      { donorID: 1, createdAt: -1 },
      { name: 'donorID_createdAt_desc', background: true }
    );

    await createIndexSafely(
      db.collection('monetarydonations'),
      { campaignID: 1 },
      { name: 'campaignID_monetary', background: true }
    );

    // Index for NonMonetaryDonation collection
    console.log('Adding indexes to nonmonetarydonations collection...');
    await createIndexSafely(
      db.collection('nonmonetarydonations'),
      { donorID: 1, createdAt: -1 },
      { name: 'donorID_createdAt_desc_nm', background: true }
    );

    await createIndexSafely(
      db.collection('nonmonetarydonations'),
      { campaignID: 1 },
      { name: 'campaignID_nonmonetary', background: true }
    );

    // Index for Payment collection (for joining with monetary donations)
    console.log('Adding indexes to payments collection...');
    await createIndexSafely(
      db.collection('payments'),
      { monetaryID: 1 },
      { name: 'monetaryID_payments', background: true }
    );

    // Index for Campaign collection
    console.log('Adding indexes to campaigns collection...');
    await createIndexSafely(
      db.collection('campaigns'),
      { _id: 1, campaignName: 1 },
      { name: '_id_campaignName_composite', background: true }
    );

    // Index for Donor collection (for faster badge updates and top donors query)
    console.log('Adding indexes to donors collection...');
    await createIndexSafely(
      db.collection('donors'),
      { totalDonations: -1, updatedAt: -1 },
      { name: 'totalDonations_desc_updatedAt_desc', background: true }
    );

    console.log('\nPerformance indexes setup completed!');

    // List all indexes to verify
    console.log('\nExisting indexes:');
    const collections = ['monetarydonations', 'nonmonetarydonations', 'payments', 'campaigns', 'donors'];

    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).listIndexes().toArray();
        console.log(`\n${collectionName}:`);
        indexes.forEach(index => {
          console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
      } catch (err) {
        console.log(`  - Collection ${collectionName} not found or no indexes`);
      }
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Index creation complete!');
  } catch (error) {
    console.error('Error adding indexes:', error);
    process.exit(1);
  }
}

addPerformanceIndexes();