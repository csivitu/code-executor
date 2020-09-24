source `${process.env.FOLDERPATH}`/code-executor/src/Runner.ts

echo $RunnerOpts

for i in RunnerOpts.length{
(cat /app/`in${i}`.txt | python3 /app/code.py) > /app/`output${i}`.txt
}