import VerifyEmail from '@/components/emails/verify-email';
import { schema } from '../../drizzle/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { Resend } from 'resend';
import { db } from '../../drizzle/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: ['delivered@resend.dev'],
        subject: 'Verify your email',
        react: VerifyEmail({ username: user.name, verifyUrl: url }),
      });
    },
  },
  sendOnSignUp: true,
  autoSignInAfterVerification: true,
  expiresIn: 3600,

  database: drizzleAdapter(db, {
    provider: 'pg', // or "mysql", "sqlite"
    schema: schema,
  }),
  plugins: [nextCookies()],
});
