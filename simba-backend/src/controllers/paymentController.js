const { prisma } = require('../config/db');
const momoService = require('../services/momoService');

/**
 * Initiate MoMo Payment
 */
const initiatePayment = async (req, res) => {
  try {
    const { orderId, phoneNumber } = req.body;

    if (!orderId || !phoneNumber) {
      return res.status(400).json({ message: 'OrderId and Phone Number are required' });
    }

    // 1. Find Order and check ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: `Order is already ${order.status}` });
    }

    // 2. Request to Pay via MoMo
    // Use depositAmount if available, otherwise use totalPrice
    const amountToPay = order.depositAmount > 0 ? order.depositAmount : order.totalPrice;
    const referenceId = await momoService.requestToPay(phoneNumber, amountToPay, order.id);

    // 3. Update Order with MoMo reference
    await prisma.order.update({
      where: { id: orderId },
      data: { momoReference: referenceId }
    });

    res.status(200).json({ 
      message: `Payment of ${amountToPay} RWF initiated. Please check your phone for the confirmation prompt.`,
      referenceId 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Check Payment Status
 */
const getStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.momoReference) {
      return res.status(400).json({ message: 'No payment initiated for this order' });
    }

    // Call MoMo Service to check status
    const status = await momoService.getPaymentStatus(order.momoReference);

    if (status === 'SUCCESSFUL') {
      // Update order status to PAID and mark deposit as paid
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'PAID',
          depositPaid: true
        }
      });

      return res.status(200).json({ 
        status: 'SUCCESSFUL', 
        message: 'Deposit paid successfully. Order is now being prepared.' 
      });
    }

    res.status(200).json({ 
      status, 
      message: status === 'PENDING' ? 'Payment is still pending confirmation' : 'Payment failed'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  initiatePayment,
  getStatus
};
