import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const SMTP_USER = process.env.SMTP_USER || 'ankitsingh14175@gmail.com';
  const SMTP_PASS = process.env.SMTP_PASS || 'zisnkydbqysbyifr';

  // Configure SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Verify SMTP connection
  transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP Connection Error:', error);
    } else {
      console.log('SMTP Server is ready to take messages');
    }
  });

  // In-memory store for OTPs (in production, use Redis or DB)
  const otpStore = new Map<string, { otp: string, expiry: number }>();

  // Send OTP Email
  app.post('/api/send-otp', async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!SMTP_USER || !SMTP_PASS) {
        return res.status(500).json({ success: false, error: 'SMTP credentials not configured.' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Email content
      const mailOptions = {
        from: {
          name: 'CropShield Intelligence',
          address: SMTP_USER
        },
        to: email,
        subject: 'Secure Access Code - CropShield',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #064e3b; background-color: #f8fbf9; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h2 style="margin-top: 0; color: #021811;">CropShield Intelligence</h2>
            <p>Hello ${name},</p>
            <p>A handshake protocol has been initiated for your CropShield account.</p>
            <div style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #10b981; margin: 20px 0;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #64748b;">This code expires in 5 minutes. Do not share this sequence.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Secure Node: CropShield AI</p>
          </div>
        `,
        text: `Your CropShield verification code is: ${otp}. This code expires in 5 minutes.`
      };

      // Send email
      await transporter.sendMail(mailOptions);
      
      // Store OTP
      otpStore.set(email, {
        otp,
        expiry: Date.now() + 5 * 60 * 1000 // 5 minutes expiry
      });
      
      res.status(200).json({ success: true, message: 'OTP sent successfully' });
      
    } catch (error: any) {
      console.error('Email sending error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send verification email',
        details: error.message
      });
    }
  });

  // Verify OTP
  app.post('/api/verify-otp', async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      const storedData = otpStore.get(email);
      
      if (storedData && storedData.otp === otp && storedData.expiry > Date.now()) {
        // Clear OTP after successful verification
        otpStore.delete(email);
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
      } else {
        res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
      }
      
    } catch (error) {
      res.status(500).json({ success: false, error: 'Verification failed' });
    }
  });

  // Send Automation Alert
  app.post('/api/send-automation-alert', async (req, res) => {
    try {
      const { email, season } = req.body;
      
      if (!SMTP_USER || !SMTP_PASS) {
        return res.status(500).json({ success: false, error: 'SMTP credentials not configured.' });
      }

      const mailOptions = {
        from: {
          name: 'CropShield Automation',
          address: SMTP_USER
        },
        to: email,
        subject: `CropShield: ${season} Season Alerts Activated`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #064e3b; background-color: #f8fbf9; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h2 style="margin-top: 0; color: #021811;">CropShield Automation</h2>
            <p>Your automated alerts for the <strong>${season}</strong> season have been successfully activated.</p>
            <p>We will monitor crop conditions and send you timely updates regarding planting, harvesting, and disease prevention.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Secure Node: CropShield AI</p>
          </div>
        `,
        text: `Your automated alerts for the ${season} season have been successfully activated.`
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Automation alert sent successfully' });
    } catch (error: any) {
      console.error('Automation email error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send automation email',
        details: error.message
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
