type WastefreeStep = {
    number: string
    title: string
    body: string
    visual: string
}

export default function WastefreeExplainer({ steps }: { steps: WastefreeStep[] }) {
    return (
        <div className="wfp-explainer" aria-label="How Waste Free Planet and IdleForest work together">
            {steps.map((step) => (
                <article key={step.number} className="wfp-explainer-step">
                    <span>{step.number}</span>
                    <div>
                        <h3>{step.title}</h3>
                        <p>{step.body}</p>
                    </div>
                </article>
            ))}
        </div>
    )
}
