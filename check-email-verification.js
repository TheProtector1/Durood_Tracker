#!/usr/bin/env node

/**
 * Email Verification Diagnostic Script
 * Checks the current state of email verification in the database
 */

const { PrismaClient } = require('@prisma/client');

async function checkEmailVerification() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 EMAIL VERIFICATION DIAGNOSTIC');
    console.log('=================================');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationExpires: true,
        createdAt: true
      }
    });

    console.log(`\n👥 Total Users: ${users.length}`);
    console.log('=================================');

    let verifiedCount = 0;
    let unverifiedCount = 0;
    let nullVerifiedCount = 0;

    users.forEach(user => {
      const verified = user.emailVerified;
      const hasToken = !!user.emailVerificationToken;
      const tokenExpired = user.emailVerificationExpires && new Date() > user.emailVerificationExpires;

      if (verified === true) {
        verifiedCount++;
        console.log(`✅ ${user.email} - VERIFIED`);
      } else if (verified === false) {
        unverifiedCount++;
        const status = hasToken ? (tokenExpired ? 'EXPIRED TOKEN' : 'HAS TOKEN') : 'NO TOKEN';
        console.log(`❌ ${user.email} - UNVERIFIED (${status})`);
      } else {
        nullVerifiedCount++;
        console.log(`⚠️  ${user.email} - NULL VERIFIED STATUS`);
      }
    });

    console.log('\n📊 SUMMARY:');
    console.log(`✅ Verified users: ${verifiedCount}`);
    console.log(`❌ Unverified users: ${unverifiedCount}`);
    console.log(`⚠️  Null verified status: ${nullVerifiedCount}`);

    // Check environment variables
    console.log('\n⚙️  EMAIL CONFIGURATION:');
    const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    const resendConfigured = !!process.env.RESEND_API_KEY;

    console.log(`SMTP configured: ${smtpConfigured ? '✅' : '❌'}`);
    console.log(`Resend configured: ${resendConfigured ? '⚠️' : '✅ (removed)'}`);

    if (smtpConfigured) {
      console.log('📧 Email verification should be REQUIRED for new signins');
    } else {
      console.log('📧 Email verification is NOT required (no email service configured)');
    }

    // Check recent signups
    console.log('\n🕒 RECENT ACCOUNTS (last 7 days):');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = users.filter(user => user.createdAt > sevenDaysAgo);
    if (recentUsers.length === 0) {
      console.log('No recent accounts found');
    } else {
      recentUsers.forEach(user => {
        const verified = user.emailVerified;
        const status = verified ? 'VERIFIED' : 'UNVERIFIED';
        console.log(`${user.email} - ${status} (${user.createdAt.toLocaleDateString()})`);
      });
    }

    console.log('\n💡 RECOMMENDATIONS:');
    if (unverifiedCount > 0 && smtpConfigured) {
      console.log('1. Unverified users will be blocked from signing in');
      console.log('2. Users need to verify their email addresses');
      console.log('3. Use the "Resend Verification Email" button on signin page');
    }

    if (!smtpConfigured && !resendConfigured) {
      console.log('1. No email service configured - email verification disabled');
      console.log('2. Set up Gmail SMTP or another email service');
    }

    if (resendConfigured) {
      console.log('1. Remove RESEND_API_KEY from Vercel environment variables');
      console.log('2. Use Gmail SMTP instead for better reliability');
    }

  } catch (error) {
    console.error('❌ Error checking email verification:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailVerification();
