import nodemailer from 'nodemailer';

// Создаем транспорт для отправки писем через Gmail
export function createEmailTransport() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const mailFrom = process.env.MAIL_FROM;

  if (!gmailUser || !gmailAppPassword || !mailFrom) {
    console.error('❌ Gmail настройки отсутствуют в .env файле');
    throw new Error('Gmail настройки не найдены');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

// Генерация 6-значного кода
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Отправка кода верификации на email
export async function sendVerificationCode(
  toEmail: string,
  code: string,
  name?: string
): Promise<boolean> {
  try {
    const transporter = createEmailTransport();
    const mailFrom = process.env.MAIL_FROM;

    const mailOptions = {
      from: mailFrom,
      to: toEmail,
      subject: 'FamilyPay - Код подтверждения регистрации',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #0D6D6E 0%, #4FD1C5 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
            }
            .code {
              background: #fff;
              border: 2px dashed #0D6D6E;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              margin: 20px 0;
              letter-spacing: 8px;
              color: #0D6D6E;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 10px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏦 FamilyPay</h1>
              <p>Управление семейными финансами</p>
            </div>
            <div class="content">
              <h2>Привет${name ? ', ' + name : ''}! 👋</h2>
              <p>Спасибо за регистрацию в FamilyPay!</p>
              <p>Ваш код подтверждения:</p>
              
              <div class="code">${code}</div>
              
              <p>Введите этот код на странице регистрации, чтобы завершить создание аккаунта.</p>
              
              <div class="warning">
                ⏰ <strong>Важно:</strong> Код действителен в течение <strong>5 минут</strong>.
              </div>
              
              <p>Если вы не регистрировались в FamilyPay, просто проигнорируйте это письмо.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} FamilyPay. Все права защищены.</p>
              <p>Это автоматическое письмо, не отвечайте на него.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
FamilyPay - Код подтверждения регистрации

Привет${name ? ', ' + name : ''}!

Спасибо за регистрацию в FamilyPay!

Ваш код подтверждения: ${code}

Введите этот код на странице регистрации, чтобы завершить создание аккаунта.

⏰ Важно: Код действителен в течение 5 минут.

Если вы не регистрировались в FamilyPay, просто проигнорируйте это письмо.

© ${new Date().getFullYear()} FamilyPay. Все права защищены.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email отправлен:', info.messageId);
    console.log('📧 Получатель:', toEmail);
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки email:', error);
    return false;
  }
}
