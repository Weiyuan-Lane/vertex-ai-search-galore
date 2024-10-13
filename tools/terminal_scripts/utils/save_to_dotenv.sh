#!/bin/sh

# INPUT VARIABLES
#   $1 - Env variable name in .env file to write for
#   $1 - Env variable value in .env file to write for
#
#   Example usage:
#
#     saveToDotEnv "GCP_PROJECT_ID" "my-gcp-project-id"
#
# OUTPUT VARIABLES
#   None
#
saveToDotEnv(){
  local _envVarToWrite=$1
  local _envValueToWrite=$2

  if [ -f ".env" ]; then
    if grep -q "$_envVarToWrite=" .env; then
      sed -i '' "s/^$_envVarToWrite=.*/$_envVarToWrite=$_envValueToWrite/" .env
    else
      echo "$_envVarToWrite=$_envValueToWrite" >> .env
    fi
  else
    echo "$_envVarToWrite=$_envValueToWrite" > .env
  fi
}
