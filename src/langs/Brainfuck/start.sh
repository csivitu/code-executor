i=$1
date +%s%N > /app/time$i.txt
timeout $2 bash -c "(cat /app/in$i.txt | brainfuck-esotope /app/Main.bf) 2> /app/error$i.txt 1> /app/output$i.txt"
echo $? > /app/exitCode$i.txt
date +%s%N >> /app/time$i.txt