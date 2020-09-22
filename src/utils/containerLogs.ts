import * as stream from 'stream';

export default async function containerLogs(container: any) {

    const outputStream = new stream.PassThrough();
    const errorStream = new stream.PassThrough();

    const logs = await container.logs({
        follow: true,
        stdout: true,
        stderr: true
    });

    container.modem.demuxStream(logs, outputStream, errorStream);

    return [outputStream, errorStream];
}
