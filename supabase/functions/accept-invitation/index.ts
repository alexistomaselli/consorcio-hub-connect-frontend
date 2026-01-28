import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        if (req.method !== 'POST') {
            return new Response('Method not allowed', { status: 405, headers: corsHeaders })
        }

        const { token, password, firstName, lastName, dni, phone, recoveryEmail, checkOnly } = await req.json()

        if (!token) {
            throw new Error('Token is required')
        }

        // 1. Verify Token
        const { data: invitation, error: inviteError } = await supabaseClient
            .from('platform_invitations')
            .select(`
          *,
          unit:units(number)
      `)
            .eq('token', token)
            .eq('status', 'PENDING')
            .single()

        if (inviteError || !invitation) {
            return new Response(
                JSON.stringify({ isValid: false, message: 'Invitación inválida o expirada' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // MODE 1: VERIFICATION ONLY
        if (checkOnly) {
            return new Response(
                JSON.stringify({
                    isValid: true,
                    firstName: '', // See note below
                    unitNumber: invitation.unit?.number || '?',
                    email: invitation.email,
                    isResident: invitation.isResident,
                    role: invitation.role
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // MODE 2: REGISTRATION
        if (!password) {
            throw new Error('Password is required for registration')
        }

        const { email, role, buildingId, unitId, isResident } = invitation
        const finalEmail = recoveryEmail || email;

        // 2. Handle User in Auth (Create or Find)
        let userId: string;

        const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
            email: finalEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
                firstName,
                lastName,
                dni,
                phoneNumber: phone,
                role: role,
                buildingId,
                unitId,
                isResident: isResident,
                isProfileComplete: true
            }
        })

        if (authError) {
            // If user already exists, we find them and update them instead of failing
            if (authError.message.includes('already registered') || authError.status === 422) {
                const { data: { users }, error: listError } = await supabaseClient.auth.admin.listUsers();
                const existingUser = users.find((u: any) => u.email?.toLowerCase() === finalEmail.toLowerCase());

                if (!existingUser) throw authError;

                userId = existingUser.id;

                // Update existing user with new metadata
                const { error: updateError } = await supabaseClient.auth.admin.updateUserById(userId, {
                    user_metadata: {
                        firstName,
                        lastName,
                        dni,
                        phoneNumber: phone,
                        role: role,
                        buildingId,
                        unitId,
                        isResident: isResident,
                        isProfileComplete: true
                    }
                });
                if (updateError) console.error('Error updating existing user:', updateError);
            } else {
                throw authError;
            }
        } else {
            userId = authUser.user.id;
        }

        // 3. Create/Update Public Profile
        const { error: profileError } = await supabaseClient
            .from('users')
            .upsert({
                id: userId,
                email: finalEmail,
                firstName,
                lastName,
                dni,
                role: role,
                phoneNumber: phone,
                whatsappNumber: phone, // Set both for compatibility
                isProfileComplete: true,
                updatedAt: new Date().toISOString()
            }, { onConflict: 'id' })

        if (profileError) {
            console.error('Profile Upsert Error:', profileError);
            throw new Error(`Error updating user profile: ${profileError.message}`);
        }

        // Update unitNumber in profile
        const { data: unitData } = await supabaseClient
            .from('units')
            .select('number')
            .eq('id', unitId)
            .single()

        if (unitData) {
            await supabaseClient
                .from('users')
                .update({ unitNumber: unitData.number })
                .eq('id', userId)
        }

        // 4. Update Unit Ownership (AND Tenancy if Resident)
        const updates: any = {};
        if (role === 'OWNER') updates.ownerId = userId;
        if (role === 'RESIDENT') updates.tenantId = userId;

        if (isResident) {
            updates.tenantId = userId;
        }

        const { error: unitUpdateError } = await supabaseClient
            .from('units')
            .update(updates)
            .eq('id', unitId)

        if (unitUpdateError) console.error('Unit Update Error:', unitUpdateError)

        // 5. Mark Invitation as Accepted
        await supabaseClient
            .from('platform_invitations')
            .update({ status: 'ACCEPTED' })
            .eq('id', invitation.id)

        return new Response(
            JSON.stringify({ message: 'Registro completado exitosamente', user: { id: userId } }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
