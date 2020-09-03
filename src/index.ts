const util = require('util');
const exec = util.promisify(require('child_process').exec);
async function lsWithGrep() {
  try {
      const { stdout, stderr } = await exec('ls | grep js');
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
  }catch (err)=>{
     console.error(err);
  };
};
lsWithGrep();