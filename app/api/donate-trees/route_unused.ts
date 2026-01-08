/* import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TREE_NATION_API_URL = 'https://youcannevertestenough.tree-nation.com/api/plant';
const TREE_NATION_API_TOKEN = process.env.TREE_NATION_TEST_API_TOKEN;
const TREE_NATION_DONATION_EMAIL = process.env.TREE_NATION_DONATION_EMAIL;

interface DonateTreesRequestBody {
  apiKey: string;
  amountSpent: number; // Assuming this is in Euros
}

export async function POST(request: Request) {
  if (!TREE_NATION_API_TOKEN) {
    console.error('Tree-Nation API token is not configured.');
    return NextResponse.json({ error: 'Internal server error: API token missing' }, { status: 500 });
  }
  if (!TREE_NATION_DONATION_EMAIL) {
    console.error('Tree-Nation donation email is not configured.');
    return NextResponse.json({ error: 'Internal server error: Donation email missing' }, { status: 500 });
  }

  try {
    const TREE_COST = 0.50;
    const MINIMUM_DONATION_THRESHOLD_FOR_TREES = 3.50; // Corresponds to 10 trees

    const supabase = await createClient();
    const body: DonateTreesRequestBody = await request.json();
    const { apiKey, amountSpent } = body;

    if (!apiKey || typeof apiKey !== 'string' || typeof amountSpent !== 'number' || amountSpent <= 0) {
      return NextResponse.json({ error: 'Invalid request body. apiKey (string) and amountSpent (positive number) are required.' }, { status: 400 });
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('api_key', apiKey)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Invalid API key.' }, { status: 401 });
    }

    

    const quantity = Math.floor(amountSpent / TREE_COST);

    const requestPayload = {
      recipients: [
        {
          name: `${company.name}`,
          email: TREE_NATION_DONATION_EMAIL,
        },
      ],
      quantity: quantity,
      language: 'en',
      message: `Thank you, ${company.name}, for supporting reforestation through Idleforest! ${quantity} tree(s) have been planted in your name.`,
    };

    const treeNationResponse = await fetch(TREE_NATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TREE_NATION_API_TOKEN}`,
      },
      body: JSON.stringify(requestPayload),
    });

    const responseData = await treeNationResponse.json();

    if (!treeNationResponse.ok) {
      console.error('Tree-Nation API error:', responseData);
      return NextResponse.json({ error: 'Failed to plant trees with Tree-Nation.', details: responseData }, { status: treeNationResponse.status });
    }

    const { error: donationError } = await supabase.from('donations').insert([
      {
        company_id: company.id,
        trees_planted: quantity,
        tree_nation_id: responseData.id, // Assuming the response has an 'id' field for the transaction
      },
    ]);

    if (donationError) {
      console.error('Failed to record donation:', donationError);
      // We don't return an error to the client here, as the tree was planted.
      // This should be monitored.
    }

    return NextResponse.json({
      message: 'Trees planted successfully!',
      treesPlanted: quantity,
      companyName: company.name,
      treeNationDetails: responseData,
    }, { status: 200 });

  } catch (error) {
    let errorMessage = 'Internal server error processing request.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error processing tree donation request:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
 */