MAKEFLAGS += --silent

# Only run the following to get .env file if the file exists
ifneq ("$(wildcard .env)","")
include .env
export $(shell sed 's/=.*//' .env)
endif

first-time-setup:
	./tools/terminal_scripts/first_time_setup.sh

bash_python:
	@docker exec -it gcloud_python_box bash
