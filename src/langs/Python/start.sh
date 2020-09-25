END=$1
for ((i=0;i<END;i++))
do
(cat /app/in$i.txt | python3 /app/code.py) > /app/output$i.txt
done