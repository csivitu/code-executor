export default function findExtension(language: string) {
    const extension = {
        python: 'py', Bash: 'sh', C: 'c', Cplusplus: 'cpp', Golfscript: 'gs', Ruby: 'rb', Javascript: 'js', Java: 'java', Perl: 'pl', Swift: 'swift',
    };
    let fileExtension = '';
    Object.keys(extension).forEach((key) => {
        if (key === language) {
            fileExtension = key;
        }
    });
    return fileExtension;
}
