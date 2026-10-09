const os = require('os');
const qrcode = require('qrcode-terminal');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Пропускаем внутренние и не IPv4 адреса
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

function showQRCode() {
  const port = process.env.PORT || 3000;
  const ip = getLocalIPAddress();
  const url = `http://${ip}:${port}`;
  
  console.log('\n=================================');
  console.log('🚀 FamilyPay Development Server');
  console.log('=================================\n');
  console.log(`📱 Local:    http://localhost:${port}`);
  console.log(`📱 Network:  ${url}\n`);
  console.log('📱 Scan QR code to open on mobile:\n');
  
  qrcode.generate(url, { small: true }, (qr) => {
    console.log(qr);
    console.log('\n=================================\n');
  });
}

showQRCode();
