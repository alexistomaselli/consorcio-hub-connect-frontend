import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import nodemailer from "npm:nodemailer@6.9.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, token, isResident, role, buildingName, unitNumber, test } = await req.json();

    if (!email && !test) {
      throw new Error('Missing required fields');
    }

    // 1. Fetch SMTP Settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('system_settings')
      .select('*')
      .in('key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass']);

    if (settingsError) throw settingsError;

    const config = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
      throw new Error('SMTP settings not configured');
    }

    // Clean password (remove spaces if copied from Google)
    const cleanPass = config.smtp_pass.replace(/\s+/g, '');

    // 2. Configure Transporter
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: parseInt(config.smtp_port || '587'),
      secure: parseInt(config.smtp_port || '587') === 465, // true for 465, false for other ports
      auth: {
        user: config.smtp_user,
        pass: cleanPass,
      },
    });

    let subject = `Invitación a Consorcio Hub - ${buildingName || 'Nuevo Edificio'}`;
    let html = '';

    if (test) {
      subject = 'Test de Configuración SMTP - Consorcio Hub';
      html = `
        <div style="font-family: Arial; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
          <h2 style="color: #166534;">¡Configuración Exitosa!</h2>
          <p>Este es un correo de prueba para verificar que tu configuración SMTP funciona correctamente.</p>
          <p><strong>Host:</strong> ${config.smtp_host}</p>
          <p><strong>Puerto:</strong> ${config.smtp_port}</p>
          <p><strong>Usuario:</strong> ${config.smtp_user}</p>
        </div>
      `;
    } else {
      // 3. Prepare Email Content
      const acceptLink = `${req.headers.get('origin') || 'http://localhost:5173'}/register/owner/${token}`;
      let roleText = isResident ? 'Propietario y Residente' : 'Propietario';
      if (role === 'RESIDENT') {
        roleText = 'Inquilino / Residente';
      }

      html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
              .content { padding: 20px; }
              .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Invitación a Consorcio Hub</h2>
              </div>
              <div class="content">
                <p>Hola,</p>
                <p>Has sido invitado a unirte a <strong>${buildingName || 'Consorcio Hub'}</strong> como <strong>${roleText}</strong> para la unidad <strong>${unitNumber || ''}</strong>.</p>
                <p>Para aceptar la invitación y completar tu registro, haz clic en el siguiente botón:</p>
                <center>
                  <a href="${acceptLink}" class="button" style="color: white;">Aceptar Invitación</a>
                </center>
                <p style="margin-top: 20px;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                <p><small>${acceptLink}</small></p>
              </div>
              <div class="footer">
                <p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
              </div>
            </div>
          </body>
          </html>
        `;
    }

    // 4. Send Email
    const info = await transporter.sendMail({
      from: `"Consorcio Hub" <${config.smtp_user}>`,
      to: email, // If test, make sure the client sends the 'to' email
      subject: subject,
      html: html,
    });

    return new Response(
      JSON.stringify({ message: 'Email sent successfully', messageId: info.messageId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
