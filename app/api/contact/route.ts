import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { name, email, companyName, companySize, location, subject, message } = await request.json();

    // Validate the input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a nodemailer transporter using Porkbun SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.PORKBUN_SMTP_HOST,
      port: parseInt(process.env.PORKBUN_SMTP_PORT || "587"), // Default to 587 if PORKBUN_SMTP_PORT is not set
      secure: process.env.PORKBUN_SMTP_PORT === '465', // true for port 465 (SSL/TLS), false for 587 (STARTTLS)
      auth: {
        user: process.env.PORKBUN_SMTP_USER,
        pass: process.env.PORKBUN_SMTP_PASSWORD,
      },
    });

    // Email to the site owner
    const ownerMailOptions = {
      from: process.env.PORKBUN_SMTP_USER, // Sender address (your Porkbun email)
      to: process.env.CONTACT_EMAIL || process.env.PORKBUN_SMTP_USER, // Recipient (your configured contact email or Porkbun email)
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${companyName ? `<p><strong>Company Name:</strong> ${companyName}</p>` : ''}
        ${companySize ? `<p><strong>Company Size:</strong> ${companySize}</p>` : ''}
        ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // Email confirmation to the user
    const userMailOptions = {
      from: process.env.PORKBUN_SMTP_USER, // Sender address (your Porkbun email)
      to: email,
      subject: `Thank you for contacting IdleForest`,
      html: `
        <h1>Thank You for Contacting IdleForest</h1>
        <p>Dear ${name},</p>
        <p>We have received your message regarding "${subject}". Our team will review your inquiry and get back to you as soon as possible.</p>
        <p>Here's a copy of your message:</p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p>Best regards,</p>
        <p>The IdleForest Team</p>
      `,
    };

    // Send emails
    await transporter.sendMail(ownerMailOptions);
    await transporter.sendMail(userMailOptions);

    return NextResponse.json(
      { success: true, message: 'Your message has been sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
