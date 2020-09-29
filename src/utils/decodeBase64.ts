export default function decodeBase64(code: string): string {
    return Buffer.from(code, 'base64').toString('ascii');
}
