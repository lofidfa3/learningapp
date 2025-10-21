#!/usr/bin/env node

// Add Stripe products directly to Firestore using Firebase REST API
const https = require('https');

const PROJECT_ID = 'linguanewes';
const API_KEY = 'AIzaSyDYXHIfb5T574P5CWyPfb-BQ1WnWJiYbic';

const PRODUCT = {
  fields: {
    active: { booleanValue: true },
    name: { stringValue: 'monthly subscription' },
    description: { stringValue: 'monthly subscription' },
    role: { stringValue: 'premium' },
    tax_code: { stringValue: 'txcd_20030000' },
    type: { stringValue: 'service' },
    images: { arrayValue: { values: [] } },
    metadata: {
      mapValue: {
        fields: {
          firebaseRole: { stringValue: 'premium' }
        }
      }
    }
  }
};

const PRICE = {
  fields: {
    active: { booleanValue: true },
    billing_scheme: { stringValue: 'per_unit' },
    currency: { stringValue: 'eur' },
    type: { stringValue: 'recurring' },
    unit_amount: { integerValue: '100' },
    product: { stringValue: 'prod_TENDUFNTcTNf9G' },
    tax_behavior: { stringValue: 'unspecified' },
    description: { stringValue: 'monthly subscription' },
    recurring: {
      mapValue: {
        fields: {
          interval: { stringValue: 'month' },
          interval_count: { integerValue: '1' },
          usage_type: { stringValue: 'licensed' }
        }
      }
    },
    metadata: { mapValue: { fields: {} } }
  }
};

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents${path}?key=${API_KEY}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body || '{}'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function syncProducts() {
  console.log('🔄 Syncing products to Firestore via REST API...\n');

  try {
    // Add product
    console.log('📦 Adding product: prod_TENDUFNTcTNf9G');
    await makeRequest('PATCH', '/products/prod_TENDUFNTcTNf9G', PRODUCT);
    console.log('✅ Product added!\n');

    // Add price
    console.log('💰 Adding price: price_1SHuT8KG36KCQ0Q54bupdoVU');
    await makeRequest('PATCH', '/products/prod_TENDUFNTcTNf9G/prices/price_1SHuT8KG36KCQ0Q54bupdoVU', PRICE);
    console.log('✅ Price added!\n');

    console.log('🎉 SYNC COMPLETE!\n');
    console.log('Now try clicking Subscribe on /pricing page!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

syncProducts();

