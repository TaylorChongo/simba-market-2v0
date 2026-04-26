const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * MoMo Service for MTN Rwanda
 */
class MomoService {
  constructor() {
    this.baseUrl = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
    this.subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
    this.apiUser = process.env.MOMO_API_USER;
    this.apiKey = process.env.MOMO_API_KEY;
    this.targetEnvironment = 'sandbox'; // or 'mtnrwanda' for production
    this.isMock = process.env.MOMO_MOCK_MODE === 'true';
  }

  /**
   * Request to Pay
   * @param {string} phone - Customer phone number (e.g., 250780000000)
   * @param {number} amount - Amount in RWF
   * @param {string} externalId - Simba Order ID
   * @returns {Promise<string>} - MoMo reference (X-Reference-Id)
   */
  async requestToPay(phone, amount, externalId) {
    const referenceId = uuidv4();

    if (this.isMock) {
      console.log(`[MOCK MOMO] RequestToPay: ${amount} RWF from ${phone} (Ref: ${referenceId})`);
      return referenceId;
    }

    try {
      // 1. Get Access Token
      const token = await this.getAccessToken();

      // 2. Call Request to Pay
      const response = await axios.post(
        `${this.baseUrl}/collection/v1_0/requesttopay`,
        {
          amount: amount.toString(),
          currency: 'RWF',
          externalId: externalId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: phone
          },
          payerMessage: 'Payment for Simba Supermarket order',
          payeeNote: 'Simba Supermarket'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': this.targetEnvironment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return referenceId;
    } catch (error) {
      console.error('MoMo RequestToPay Error:', error.response?.data || error.message);
      throw new Error('Failed to initiate MoMo payment');
    }
  }

  /**
   * Get Payment Status
   * @param {string} referenceId - MoMo reference ID
   * @returns {Promise<string>} - Status (PENDING, SUCCESSFUL, FAILED)
   */
  async getPaymentStatus(referenceId) {
    if (this.isMock) {
      // Simulate success after 5 seconds
      return 'SUCCESSFUL';
    }

    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': this.targetEnvironment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey
          }
        }
      );

      return response.data.status; // SUCCESSFUL, FAILED, PENDING
    } catch (error) {
      console.error('MoMo GetStatus Error:', error.response?.data || error.message);
      throw new Error('Failed to check MoMo payment status');
    }
  }

  /**
   * Internal: Get Access Token
   */
  async getAccessToken() {
    const auth = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
    const response = await axios.post(
      `${this.baseUrl}/collection/token/`,
      {},
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey
        }
      }
    );
    return response.data.access_token;
  }
}

module.exports = new MomoService();
