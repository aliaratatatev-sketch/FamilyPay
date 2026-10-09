#!/usr/bin/env node

const { spawn } = require('child_process');
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
  
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║  🚀 FamilyPay Development Server     ║');
  console.log('╚═══════════════════════════════════════╝\n');
  console.log(`📱 Local:    http://localhost:${port}`);
  console.log(`📱 Network:  ${url}\n`);
  console.log('📱 Scan QR code to open on mobile:\n');
  
  qrcode.generate(url, { small: true }, (qr) => {
    console.log(qr);
    console.log('\n═══════════════════════════════════════\n');
  });
}

// Запускаем Next.js dev сервер
const nextProcess = spawn('next', ['dev'], {
  stdio: 'pipe',
  shell: true,
  cwd: process.cwd()
});

let qrShown = false;

// Обрабатываем stdout
nextProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  // Показываем QR код когда сервер готов
  if (!qrShown && (output.includes('Ready in') || output.includes('Local:'))) {
    setTimeout(() => {
      showQRCode();
      qrShown = true;
    }, 500);
  }
});

// Обрабатываем stderr
nextProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Обрабатываем завершение
nextProcess.on('close', (code) => {
  process.exit(code);
});

// Обрабатываем Ctrl+C
process.on('SIGINT', () => {
  nextProcess.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM');
  process.exit();
});
