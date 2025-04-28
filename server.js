const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// CORS Options
const corsOptions = {
  origin: 'https://ateliersociety.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight requests support

app.use(express.json());

// Your environment variables
const SHOPIFY_STORE = process.env.SHOPIFY_STORE; // Example: 'your-store.myshopify.com'
const SHOPIFY_ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN; // From Shopify Admin

// Material type to Variant ID mapping
const materialVariantMap = {
  "Denim/Canvas": "53588940751139",
  "Delicate": "53588940783907",
  "Wool": "53588940816675",
  "Down-Filled": "53588940849443",
  "Standard Fabric": "53588941832483"
};

// Handle surcharge adding
app.post('/add-surcharge', async (req, res) => {
  // Manual CORS headers (for Vercel strict environments)
  res.setHeader('Access-Control-Allow-Origin', 'https://ateliersociety.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { materialType } = req.body;

  console.log(`Received request to add surcharge for material: ${materialType}`);

  if (!materialType || !materialVariantMap[materialType]) {
    return res.status(400).json({ error: 'Invalid or missing material type.' });
  }

  try {
    const variantId = materialVariantMap[materialType];

    const response = await axios.post(`https://${SHOPIFY_STORE}/cart/add.js`, {
      id: variantId,
      quantity: 1
    }, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Surcharge variant added successfully.');
    res.status(200).json({ message: 'Surcharge added successfully.' });
  } catch (error) {
    console.error('❌ Error adding surcharge:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to add surcharge.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
