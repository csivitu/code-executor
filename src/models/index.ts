export interface TestCase {
    input: string;
    output: string;
}

export interface Code {
    id: string;
    code: string,
    language: string,
    testCases: TestCase[];
}
