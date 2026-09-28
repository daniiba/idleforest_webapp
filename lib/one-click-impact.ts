// Plants trees through 1ClickImpact, the provider behind the desktop install
// bonus and tree claims. Throws on any failure so callers can mark the reward
// as failed and retry later.
export async function plantTreesWithOneClickImpact(input: {
    amount: number
    customerEmail: string
    customerName: string
}): Promise<unknown> {
    const apiKey = process.env.ONE_CLICK_IMPACT_API_KEY
    if (!apiKey) {
        throw new Error('Missing 1ClickImpact API key')
    }

    const response = await fetch('https://api.1clickimpact.com/v1/plant_tree', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: input.amount,
            customer_email: input.customerEmail,
            customer_name: input.customerName,
            category: 'food',
        }),
    })

    const responseText = await response.text()

    if (!response.ok) {
        throw new Error(responseText || `1ClickImpact responded with ${response.status}`)
    }

    try {
        return responseText ? JSON.parse(responseText) : null
    } catch {
        return { raw: responseText }
    }
}
