import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface EmailPayload {
  to: string
  restaurantName: string
  role: string
  invitationUrl: string
  expirationDate: string
  isResend?: boolean
}

serve(async (req) => {
  // Create a Supabase client with the Auth context of the function
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )

  // Get the request body
  const payload: EmailPayload = await req.json()
  
  // Validate required fields
  if (!payload.to || !payload.restaurantName || !payload.role || !payload.invitationUrl || !payload.expirationDate) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields in the request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Format the role for display (capitalize first letter)
    const formattedRole = payload.role.charAt(0).toUpperCase() + payload.role.slice(1)
    
    // Create email subject
    const subject = payload.isResend 
      ? `Invitation Reminder: Join ${payload.restaurantName} on Manassist Hub`
      : `You've Been Invited to Join ${payload.restaurantName} on Manassist Hub`
    
    // Create email body
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Restaurant Invitation</h2>
        <p>Hi there,</p>
        <p>You've been invited to join <strong>${payload.restaurantName}</strong> as a <strong>${formattedRole}</strong> on Manassist Hub.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${payload.invitationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
            Accept Invitation
          </a>
        </div>
        <p>This invitation expires on <strong>${payload.expirationDate}</strong>.</p>
        <p>If you don't have an account yet, you'll be able to create one when you accept the invitation.</p>
        <p>If you believe this invitation was sent in error, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 14px;">Manassist Hub - Restaurant Management Platform</p>
      </div>
    `
    
    // Send the email
    const { error } = await supabaseClient.auth.admin.sendEmail(
      payload.to,
      {
        subject,
        html: htmlBody,
      }
    )

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})