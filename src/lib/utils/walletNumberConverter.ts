export function formatNumber(num: number): string {
    if (Math.abs(num) >= 1) {
        return num.toFixed(2);
    }

    let str = num.toString();
    if (!str.includes(".")) return "0.00";

    let decimalPart = str.split(".")[1];

    let result = "0.";
    let foundNonZero = false;

    for (let i = 0; i < decimalPart.length; i++) {
        let char = decimalPart[i];
        result += char;

        if (foundNonZero) return result + (decimalPart[i + 1] ?? "");
        if (char !== "0") foundNonZero = true;
    }

    return result;
}