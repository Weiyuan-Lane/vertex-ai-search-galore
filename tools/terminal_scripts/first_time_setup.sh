#!/bin/sh

# Include all common script dependencies --------------------------------------
source 'tools/terminal_scripts/utils/load_script_env_vars.sh'
source 'tools/terminal_scripts/utils/echo_and_run.sh'
source 'tools/terminal_scripts/utils/prompt_user_input.sh'
source 'tools/terminal_scripts/utils/save_to_dotenv.sh'
# ----------------------------------------------------------------- Include End

promptUserEntry \
  'gcpProjectId' \
  "${ECHO_YELLOW_COLOR}Please input your Google Cloud Platform Project ID:${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}Use the same project id? (${ECHO_WHITE_COLOR}Y/n${ECHO_YELLOW_COLOR}):${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}You previously inputted GCP Project ID as${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}You inputted GCP Project ID as${ECHO_NO_COLOR}" \
  "${ECHO_RED_COLOR}Please input a valid value.${ECHO_NO_COLOR}"

promptUserEntry \
  'gcpLocation' \
  "${ECHO_YELLOW_COLOR}Please input your intended GCP region (See region available here - https://cloud.google.com/about/locations):${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}Use the same region? (${ECHO_WHITE_COLOR}Y/n${ECHO_YELLOW_COLOR}):${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}You previously inputted region as${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}You inputted GCP region as${ECHO_NO_COLOR}" \
  "${ECHO_RED_COLOR}Please input a valid value.${ECHO_NO_COLOR}"

promptUserEntry \
  'geminiModel' \
  "${ECHO_YELLOW_COLOR}Please input your intended Gemini model version (See versions available here - https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference#supported-models):${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}Use the same version? (${ECHO_WHITE_COLOR}Y/n${ECHO_YELLOW_COLOR}):${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}You previously inputted Gemini model as${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}You inputted Gemini model as${ECHO_NO_COLOR}" \
  "${ECHO_RED_COLOR}Please input a valid value.${ECHO_NO_COLOR}"

promptUserEntry \
  'gcpVertexAISearchEngineId' \
  "${ECHO_YELLOW_COLOR}Please input your Vertex AI Search Engine Id (Create here - https://console.cloud.google.com/gen-app-builder/engines):${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}Use the same version? (${ECHO_WHITE_COLOR}Y/n${ECHO_YELLOW_COLOR}):${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}You previously inputted Search Engine Id as${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}You inputted Search Engine Id as${ECHO_NO_COLOR}" \
  "${ECHO_RED_COLOR}Please input a valid value.${ECHO_NO_COLOR}"

promptUserEntry \
  'gcpVertexAISearchLocation' \
  "${ECHO_YELLOW_COLOR}Please input your Vertex AI Search Location (See here - https://console.cloud.google.com/gen-app-builder/engines):${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}Use the same version? (${ECHO_WHITE_COLOR}Y/n${ECHO_YELLOW_COLOR}):${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}You previously inputted Search Engine Location as${ECHO_NO_COLOR}" \
  "${ECHO_YELLOW_COLOR}You inputted Search Engine Location as${ECHO_NO_COLOR}" \
  "${ECHO_RED_COLOR}Please input a valid value.${ECHO_NO_COLOR}"

gcpProjectIdNum=`gcloud projects describe $gcpProjectId --format="value(projectNumber)"`

saveToDotEnv "GCP_PROJECT_ID" $gcpProjectId
saveToDotEnv "GCP_PROJECT_NUMBER" $gcpProjectIdNum
saveToDotEnv "GCP_REGION" $gcpLocation
saveToDotEnv "GCP_GEMINI_VER" $geminiModel
saveToDotEnv "GCP_VERTEXAI_SEARCH_ENGINE_ID" $gcpVertexAISearchEngineId
saveToDotEnv "GCP_VERTEXAI_SEARCH_LOCATION" $gcpVertexAISearchLocation

tee ./node-serverless/server/config/env.js <<EOF > /dev/null
module.exports = {
  GCP_PROJECT_ID: '$gcpProjectId',
  GCP_PROJECT_ID_NUMBER: '$gcpProjectIdNum',
  GCP_REGION: '$gcpLocation',
  GCP_GEMINI_VER: '$geminiModel',
  GCP_VERTEXAI_SEARCH_ENGINE_ID: '$gcpVertexAISearchEngineId',
  GCP_VERTEXAI_SEARCH_LOCATION: '$gcpVertexAISearchLocation',
  PORT: 8080,
};
EOF
