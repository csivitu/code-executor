export default function findExtension(language: string) {
    const extension = {
        python: 'py', Bash: 'sh', C: 'c', Cplusplus: 'cpp', Golfscript: 'gs', Ruby: 'rb', Javascript: 'js', Java: 'java', Perl: 'pl', Swift: 'swift', Rust: 'rs', Brainfuck: 'bf', O5AB1E: 'abe',
    };
    let fileExtension = '';
    Object.entries(extension).forEach((entry) => {
        const [key, value] = entry;
        if (key === language) {
            fileExtension = value;
        }
    });
    return fileExtension;
}
