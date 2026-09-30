const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const app = express();
app.use(express.json());

let sock;

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  sock = makeWASocket({ auth: state, printQRInTerminal: true });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', ({ qr }) => {
    if(qr) console.log("QR CODE:", qr); // Ye QR render ke log me dikhega
  });
}
start();

// Ye tumhari website hit karegi
app.post('/send-order', async (req, res) => {
  const { owner_number, order_id, customer, amount } = req.body;
  // owner_number = 918160011631 jaise

  try {
    await sock.sendMessage(owner_number + '@s.whatsapp.net', {
      text: `🛒 *Naya Order Aaya!*\n\n*Order ID:* ${order_id}\n*Customer:* ${customer}\n*Amount:* ₹${amount}\n\nAdmin panel check karo.`
    });
    res.json({ success: true });
  } catch(e) {
    res.json({ success: false, error: e.message });
  }
});

app.listen(3000);
