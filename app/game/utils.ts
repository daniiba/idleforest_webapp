export function formatNumber(num: number): string {
    if (num < 1_000_000) {
        return num.toLocaleString();
    }

    const suffixes = [
        { value: 1e6, symbol: " Million" },
        { value: 1e9, symbol: " Billion" },
        { value: 1e12, symbol: " Trillion" },
        { value: 1e15, symbol: " Quadrillion" },
        { value: 1e18, symbol: " Quintillion" },
    ];

    // Reverse loop to find the largest suffix that matches
    for (let i = suffixes.length - 1; i >= 0; i--) {
        if (num >= suffixes[i].value) {
            return (num / suffixes[i].value).toFixed(2) + suffixes[i].symbol;
        }
    }

    return num.toExponential(2);
}
