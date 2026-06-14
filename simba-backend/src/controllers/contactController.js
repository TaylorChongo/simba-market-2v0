const { prisma } = require('../config/db');

const submitMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const contactMessage = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });
    res.status(201).json({ message: 'Message sent successfully', data: contactMessage });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

module.exports = { submitMessage };
