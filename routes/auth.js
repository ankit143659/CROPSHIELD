// routes/auth.js (Backend API)
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'kothwahighschool@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password' // Use App Password, not regular password
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

// Send OTP Email
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Email content
    const mailOptions = {
      from: {
        name: 'FLORA Expert v4',
        address: process.env.SMTP_USER
      },
      to: email,
      subject: 'Secure Access Code - FLORA Expert v4',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #021811; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f8fbf9; }
            .otp-code { font-size: 42px; font-weight: bold; color: #021811; letter-spacing: 10px; text-align: center; margin: 30px 0; }
            .footer { background: #021811; color: #10b981; padding: 20px; text-align: center; font-size: 12px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: #10b981; margin: 0;">FLORA Expert v4</h1>
              <p style="color: #d1fae5; margin: 5px 0 0 0;">Secured Botanical Research Node</p>
            </div>
            
            <div class="content">
              <h2 style="color: #021811;">Protocol Verification Required</h2>
              <p>Hello ${name},</p>
              <p>You are attempting to access the FLORA Expert v4 research portal. Use the following verification code to complete your registration:</p>
              
              <div class="otp-code">${otp}</div>
              
              <div class="warning">
                <strong>Security Notice:</strong> This code will expire in 2 minutes. Do not share this code with anyone.
              </div>
              
              <p>If you did not initiate this request, please ignore this email or contact system administration.</p>
              
              <p>Best regards,<br>FLORA Security System</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from FLORA Expert v4 Security Protocol</p>
              <p>© ${new Date().getFullYear()} Botanical Research Network. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Your FLORA Expert v4 verification code is: ${otp}. This code expires in 2 minutes.`
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    
    // Store OTP in session/database (in production, use Redis or database)
    req.session.otp = otp;
    req.session.otpEmail = email;
    req.session.otpExpiry = Date.now() + 120000; // 2 minutes expiry
    
    res.status(200).json({
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) // For testing with Ethereal
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send verification email',
      details: error.message
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // In production, verify against database/Redis
    if (req.session.otpEmail === email && 
        req.session.otp === otp && 
        req.session.otpExpiry > Date.now()) {
      
      // Clear OTP after successful verification
      delete req.session.otp;
      delete req.session.otpExpiry;
      
      res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
    
  } catch (error) {
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

module.exports = router;