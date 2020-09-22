import Docker from 'dockerode';
import Builder from '../src/Builder';
import Worker from '../src/Worker';
import * as dotenv from 'dotenv';

dotenv.config();

const worker = new Worker();
const docker = new Docker();
const builder = new Builder(docker);

const inputs = [{
    id: '1', language: 'python', code: 'print(`hello`)', testCases: [{ input: '', output: 'hello' }],
}];

inputs.forEach((input) => {
    builder.build(input.language);
    worker.work(input);
});