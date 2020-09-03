import util from 'util';
import { exec } from 'child_process';

const execute = util.promisify(exec);
async function lsWithGrep() {
    try {
        const { stdout, stderr } = await execute('ls | grep js');
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
    } catch (err) {
        console.error(err);
    }
}

lsWithGrep();
