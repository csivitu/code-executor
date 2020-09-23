export interface TestCase {
    input: string;
    output: string;
}

export interface Code {
    id: string;
    code: string,
    language: string,
    base64?: boolean,
    testCases: TestCase[];
}
