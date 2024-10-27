MAKEFLAGS += --silent

# Only run the following to get .env file if the file exists
ifneq ("$(wildcard .env)","")
include .env
export $(shell sed 's/=.*//' .env)
endif

# Setup commands --------------------------------------------------------------

first-time-setup:
	./tools/terminal_scripts/first_time_setup.sh

run_python_setup_command:
ifdef resource_id
	@docker exec -t python-setup bash -c "python3 -m venv /opt/venv && source /opt/venv/bin/activate && python3 app.py $(command) --resource_id=$(resource_id)"
else
	@docker exec -t python-setup bash -c "python3 -m venv /opt/venv && source /opt/venv/bin/activate && python3 app.py $(command)"
endif

# Shell commands --------------------------------------------------------------

bash_python_setup:
	@docker exec -it python-setup bash

bash_node_server:
	@docker exec -it node-serverless-server sh

bash_node_client:
	@docker exec -it node-serverless-client sh

bash_python_server:
	@docker exec -it python-serverless sh

node_client_build:
	@docker exec -it node-serverless-client sh -c "npm run build"

# Docker commands -------------------------------------------------------------

docker_build_node_serverless:
	@cd node-serverless && docker build --platform linux/amd64 -t node-serverless-server .

docker_test_node_serverless:
	@docker run -v $$(pwd)/node-serverless/server/config:/opt/app/server/config -v $$HOME/.config/gcloud/application_default_credentials.json:/gcp/creds.json:ro -e GOOGLE_APPLICATION_CREDENTIALS=/gcp/creds.json -p 8080:8080 node-serverless-server:latest

docker_build_python_serverless:
	@cd python-serverless && DOCKER_BUILDKIT=0 docker build --platform linux/amd64 -t python-serverless-server .

docker_test_python_serverless:
	@docker run -v $$(pwd)/.env:/opt/env/.env -v $$HOME/.config/gcloud/application_default_credentials.json:/gcp/creds.json:ro -e GOOGLE_APPLICATION_CREDENTIALS=/gcp/creds.json -p 8080:8080 python-serverless-server:latest
