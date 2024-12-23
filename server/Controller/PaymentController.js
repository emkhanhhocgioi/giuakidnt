const express = require('express');
const axios = require('axios');const { config } = require('dotenv');
const { link } = require('../routes/PaymentRoutes');
require('dotenv').config(); 
const getAccessToken = async () => {

  const response = await axios({
    url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    method: 'post',
    data: 'grant_type=client_credentials',
    auth: {
      username: process.env.paypal_clientID,
      password: process.env.paypal_KEY,
    },
  });

  return response.data.access_token;
};

const createPaymentOrder = async (req, res) => {
    const{plan,price} = req.body;
    console.log(price)
    try {
      const access_token = await getAccessToken();
  
      const response = await axios({
        url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        data: {
          intent: 'CAPTURE',
          purchase_units: [
            {
              items: [
                {
                  name: 'Premium subscription',
                  description: 'Premium partner subscription',
                  quantity: 1,
                  unit_amount: {
                    currency_code: 'USD',
                    value: price,
                  },
                },
              ],
              amount: {
                currency_code: 'USD',
                value: price,
                breakdown: {
                  item_total: {
                    currency_code: 'USD',
                    value: price,
                  },
                },
              },
            },
          ],
          application_context: {
            brand_name: 'Sign up for Premium eBooking plan',
            return_url: 'http://10.0.2.2:5000/api/complete-payment',
            cancel_url: 'https://example.com/cancel',
          },
        },
      });
  
    
      res.status(200).json(
        response.data.links.find((link) => link.rel === 'approve').href
      );
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to create payment order' });
    }
  };
  const capturePaymentOrder = async (orderId) => {
    const access_token = await getAccessToken();
  
    const response = await axios({
      url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });
  
    return response.data;
  };
module.exports = { createPaymentOrder,capturePaymentOrder };
