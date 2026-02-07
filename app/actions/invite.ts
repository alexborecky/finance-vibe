'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function inviteUser(email: string, role: 'admin' | 'user') {
    const supabase = await createClient()

    // 1. Verify Authentication & Permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized', success: false }
    }

    // Check if user is admin
    // We can stick to the `is_admin` function logic or just query the profile
    const { data: profile } = await (supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as any)

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
        return { error: 'Forbidden: Admin access required', success: false }
    }

    // 2. Generate Token & Expires At
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

    // 3. Store Invitation in Database
    const { error: dbError } = await (supabase
        .from('invitations' as any) as any)
        .insert({
            email,
            role,
            invited_by: user.id,
            token,
            expires_at: expiresAt.toISOString(),
        })

    if (dbError) {
        console.error('Error creating invitation in DB:', dbError)
        return { error: 'Failed to create invitation record', success: false }
    }

    // 4. Send Email via Resend
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/signup?token=${token}`

    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is not set. Skipping email send.')
            // We return success here because the DB record was created, but we warn about the email.
            // Ideally, in dev without key, this is "success".
            return {
                success: true,
                message: 'Invitation created (Email skipped: Missing API Key)',
                inviteUrl // Return URL so admin can manually share it if email fails
            }
        }

        const { error: emailError } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Finance Vibe <onboarding@resend.dev>',
            to: email,
            subject: 'You have been invited to Finance Vibe',
            html: `
        <div>
          <h1>Welcome to Finance Vibe!</h1>
          <p>You have been invited to join Finance Vibe as a <strong>${role}</strong>.</p>
          <p>Click the link below to accept your invitation and set up your account:</p>
          <a href="${inviteUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
          <p>Or copy this link: ${inviteUrl}</p>
          <p>This link expires in 7 days.</p>
        </div>
      `,
        })

        if (emailError) {
            console.error('Resend API Error:', emailError)
            return {
                success: true,
                message: `Invitation created but email failed: ${emailError.message}`,
                inviteUrl,
                emailError: emailError.message
            }
        }

        return { success: true, message: 'Invitation sent successfully' }

    } catch (error: any) {
        console.error('Unexpected error sending email:', error)
        return {
            success: true,
            message: `Invitation created but email failed: ${error.message || 'Unknown error'}`,
            inviteUrl
        }
    }
}
