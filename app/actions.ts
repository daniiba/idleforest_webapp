'use server'

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitEmail(email: string, deviceInfo: any) {
    try {
        // Create Contact (Global, no audience ID needed)
        const { data, error } = await resend.contacts.create({
            email: email,
            unsubscribed: false,
        });

        if (error) {
            console.error('Error adding contact to Resend:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error submitting email:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
