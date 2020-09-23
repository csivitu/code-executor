export default function findExtension(language: string) {
    const extension = {
        python: 'py', Bash: 'bash', C: 'c', Cplusplus: 'cpp', Golfscript: 'gs', Ruby: 'rb', Javascript: 'js', Java: 'java', Perl: 'pl', Swift: 'swift',
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
