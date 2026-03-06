pnpm build
pnpm preview &
PID=$!
sleep 5
lsof -i -P -n | grep LISTEN
kill $PID
