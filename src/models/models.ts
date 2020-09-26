export interface TestCase {
    input: string;
    output: string;
}

export interface Code {
    id: string;
    code: string;
    language: string;
    base64?: boolean;
    testCases: TestCase[];
}

export interface Tests {
    input: string;
    expectedOutput: string;
    obtainedOutput: string;
    remarks: string;
    exitCode: number;
    runTime: number;
    error: string;
}

export interface Result {
    id: string;
    tests: Tests[];
}
