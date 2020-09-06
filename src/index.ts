import Docker from 'dockerode';

import Builder from './Builder';
import Runner from './Runner';

const docker = new Docker();
const builder = new Builder(docker);
builder.build('python-runner');
const runner = new Runner(docker);
runner.runner('python-runner');
