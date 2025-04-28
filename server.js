const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Setup CORS properly
app.use(cors({
  origin: 'https://ateliersociety.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Shopify Environment Variables
const SHOPIFY_STORE = process.env.SHOPIFY_STORE; // Example: ateliersociety.myshopify.com
const SHOPIFY_ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

// Material Type to Variant ID Map
const materialVariantMap = {
  "Denim/Canvas": "53588940751139",
  "Delicate": "53588940783907",
  "Wool": "53588940816675",
  "Down-Filled": "53588940849443",
  "Standard Fabric": "53588941832483"
};

// Handle POST request
app.post('/add-surcharge', async (req, res) => {
  const { materialType } = req.body;

  console.log(`Received material type: ${materialType}`);

  if (!materialType || !materialVariantMap[materialType]) {
    return res.status(400).json({ error: 'Invalid or missing material type.' });
  }

  try {
    const variantId = materialVariantMap[materialType];

    await axios.post(`https://${SHOPIFY_STORE}/cart/add.js`, {
      id: variantId,
      quantity: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN
      }
    });

    console.log('✅ Surcharge variant added successfully.');
    res.status(200).json({ message: 'Surcharge added successfully.' });
  } catch (error) {
    console.error('❌ Error adding surcharge:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to add surcharge.' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
