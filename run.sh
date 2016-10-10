#!/bin/sh
# run.sh

# Run the bot and loop if the bot closes
while true; do
	node bot --color
	sleep .25
done
