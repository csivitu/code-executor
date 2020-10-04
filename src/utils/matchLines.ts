export default function matchLines(expected: string, obtained: string): 'Pass' | 'Fail' {
    function splitAndTrim(code: string) {
        return code.split('\n').map((sentence) => sentence.trim());
    }

    const expectedArray = splitAndTrim(expected);
    const obtainedArray = splitAndTrim(obtained);

    const minLength = Math.min(expectedArray.length, obtainedArray.length);

    for (let i = 0; i < minLength; i += 1) {
        if (expectedArray[i] !== obtainedArray[i]) {
            return 'Fail';
        }
    }

    return 'Pass';
}
