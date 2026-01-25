import nodemailer from 'nodemailer';
// server.ts / main.ts / index.ts / next.config.js


// Debug: 检查环境变量
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

interface SendVerificationEmailOptions {
  to: string;
  code: string;
  type: 'register' | 'reset_password';
}

/**
 * Send verification email
 * @param options - Email options including recipient, code, and type
 */
export async function sendVerificationEmail(options: SendVerificationEmailOptions): Promise<void> {
  const { to, code, type } = options;

  // 使用环境变量配置 SMTP 主机，支持域名或 IP
  // 本地开发可能需要 IP，生产环境可以用域名
  const smtpHost = process.env.SMTP_HOST || 'smtp.163.com';

  console.log('SMTP Host:', smtpHost);

  // Create transporter inside the function
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: 465,
    secure: true, // 使用 SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1' as const,
      servername: 'smtp.163.com', // SSL 握手时使用的服务器名称
    },
    family: 4, // 强制使用 IPv4
    connectionTimeout: 10000, // 连接超时 10秒
    greetingTimeout: 10000,   // 握手超时 10秒
    socketTimeout: 15000,     // socket 超时 15秒
  } as any);
  console.log('开始验证 SMTP...');
  await transporter.verify();   // 👈 加在这里
  console.log('SMTP 验证通过');

  const subject = type === 'register' ? '注册验证码' : '密码重置验证码';
  const title = type === 'register' ? '欢迎注册' : '密码重置';
  const description = type === 'register'
    ? '感谢您注册我们的服务！请使用以下验证码完成注册：'
    : '您正在重置密码，请使用以下验证码完成操作：';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #e0e0e0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
        }
        .code-container {
          background: white;
          border: 2px dashed #2563eb;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .info {
          color: #666;
          font-size: 14px;
          margin-top: 20px;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 4px;
          padding: 12px;
          margin-top: 20px;
          font-size: 14px;
          color: #856404;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <p>${description}</p>
        <div class="code-container">
          <div class="code">${code}</div>
        </div>
        <div class="info">
          <p>验证码有效期为 <strong>10分钟</strong>，请尽快使用。</p>
          <p>如果您没有请求此验证码，请忽略此邮件。</p>
        </div>
        <div class="warning">
          ⚠️ 请勿将验证码透露给他人，以保护您的账户安全。
        </div>
        <div class="footer">
          <p>此邮件由系统自动发送，请勿回复。</p>
          <p>如果邮件未正确显示，请检查您的垃圾邮件文件夹。</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"公考助手" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    console.log('开始发送邮件...');
    console.log('SMTP配置:', {
      host: 'smtp.163.com',
      port: 465,
      user: process.env.EMAIL_USER,
      to: to
    });

    // 添加超时保护
    const sendMailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('邮件发送超时（30秒）')), 30000);
    });

    await Promise.race([sendMailPromise, timeoutPromise]);
    console.log(`✓ 验证邮件已成功发送到 ${to}`);
  } catch (error: any) {
    console.error('✗ 发送邮件失败:');
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    console.error('完整错误:', error);

    // 提供更具体的错误信息
    if (error.message.includes('超时')) {
      throw new Error('邮件发送超时，请检查网络连接或SMTP服务器状态');
    } else if (error.code === 'EAUTH') {
      throw new Error('邮箱认证失败，请检查邮箱账号和授权码');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('无法连接到邮件服务器，请检查网络设置');
    } else {
      throw new Error(`发送邮件失败: ${error.message}`);
    }
  }
}
