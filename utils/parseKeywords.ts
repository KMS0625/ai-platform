export function parseKeywords(input: string): string[] {
    return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

export function stringToArray(text: string, delimiter: string = ",")
{
    return text.split(delimiter).map((item) => item.trim()).filter((item) => item !== "");
}

export function ArrayToString(array: string[], delimiter: string = ", ") {
    return array.join(delimiter);
}