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
        { value: 1e21, symbol: " Sextillion" },
        { value: 1e24, symbol: " Septillion" },
        { value: 1e27, symbol: " Octillion" },
        { value: 1e30, symbol: " Nonillion" },
        { value: 1e33, symbol: " Decillion" },
        { value: 1e36, symbol: " Undecillion" },
        { value: 1e39, symbol: " Duodecillion" },
        { value: 1e42, symbol: " Tredecillion" },
        { value: 1e45, symbol: " Quattuordecillion" },
        { value: 1e48, symbol: " Quindecillion" },
        { value: 1e51, symbol: " Sexdecillion" },
        { value: 1e54, symbol: " Septendecillion" },
        { value: 1e57, symbol: " Octodecillion" },
        { value: 1e60, symbol: " Novemdecillion" },
        { value: 1e63, symbol: " Vigintillion" },
    ];

    // Reverse loop to find the largest suffix that matches
    for (let i = suffixes.length - 1; i >= 0; i--) {
        if (num >= suffixes[i].value) {
            return (num / suffixes[i].value).toFixed(2) + suffixes[i].symbol;
        }
    }

    return num.toExponential(2);
}
