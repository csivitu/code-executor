export default function matchLines(expected: string, obtained: string): 'Pass' | 'Fail' {
    function splitAndTrim(code: string) {
        return code.split('\n').map((sentence) => sentence.trimEnd());
    }

    const expectedArray = splitAndTrim(expected.trim());
    const obtainedArray = splitAndTrim(obtained.trim());

    if (expectedArray.length !== obtainedArray.length) {
        return 'Fail';
    }

    const { length } = expectedArray;

    for (let i = 0; i < length; i += 1) {
        if (expectedArray[i] !== obtainedArray[i]) {
            return 'Fail';
        }
    }

    return 'Pass';
}
