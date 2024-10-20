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

bash_node_server:
	@docker exec -it node-serverless-server sh

bash_node_client:
	@docker exec -it node-serverless-client sh

node_client_build:
	@docker exec -it node-serverless-client sh -c "npm run build"

docker_build_node_serverless:
	@cd node-serverless && docker build --platform linux/amd64 -t node-serverless-server .
