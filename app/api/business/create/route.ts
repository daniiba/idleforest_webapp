import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient(); // Use server client from '@/lib/supabase/server'
  const body = await request.json();
  const { companyName, website, userId: requestUserId } = body;

  let finalUserId: string | undefined = requestUserId;

  // If userId is not directly provided in the request (e.g., from signup flow),
  // try to get it from the current session (e.g., for dashboard form submission by a logged-in user)
  if (!finalUserId) {
    const { data: { user: sessionUser } } = await supabase.auth.getUser();
    if (sessionUser) {
      finalUserId = sessionUser.id;
    } else {
      return NextResponse.json({ error: 'Authentication required. User ID not provided and no active session.' }, { status: 401 });
    }
  }

  // This check should ideally be redundant if the logic above is sound, but acts as a safeguard.
  if (!finalUserId) { 
    return NextResponse.json({ error: 'User ID could not be determined.' }, { status: 400 });
  }

  if (!companyName) {
    return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
  }

  // Check if the user (identified by finalUserId) already has a company
  const { data: existingCompany, error: existingCompanyError } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', finalUserId)
    .single();

  // Handle potential errors during the check, excluding 'PGRST116' (no rows found, which is expected if no company exists)
  if (existingCompanyError && existingCompanyError.code !== 'PGRST116') {
    console.error('Error checking for existing company:', existingCompanyError);
    return NextResponse.json({ error: 'Failed to check for existing company.' }, { status: 500 });
  }

  if (existingCompany) {
    return NextResponse.json({ error: 'This user already has a company profile.' }, { status: 400 });
  }

  // Create the company
  const { data: newCompany, error: createError } = await supabase
    .from('companies')
    .insert({
      user_id: finalUserId,
      name: companyName,
      website: website || null // Ensure website is null if not provided and column allows nulls
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating company:', createError);
    return NextResponse.json({ error: `Failed to create company: ${createError.message}` }, { status: 500 });
  }

  // Attempt to update the user's role in a 'profiles' table
  // This assumes a 'profiles' table exists, is linked to auth.users via a 'user_id' column,
  // and has a 'role' column to be updated.
  const { error: updateError } = await supabase
    .from('profiles') 
    .update({ role: 'business' })
    .eq('user_id', finalUserId); 

  if (updateError) {
    console.error('Error updating user role (this is non-critical for company creation):', updateError.message);
    // Log this error but don't fail the entire request as the company was successfully created.
    // This could happen if the profile doesn't exist yet for a new user, or the 'user_id' / 'role' columns are named differently or missing.
  }

  return NextResponse.json({ message: 'Company created successfully!', company: newCompany }, { status: 201 });
}
