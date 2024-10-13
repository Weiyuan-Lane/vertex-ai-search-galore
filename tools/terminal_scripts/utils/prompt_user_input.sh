#!/bin/sh

TMP_DIR=".tmp"
mkdir -p $TMP_DIR
PROMPT_DIR="prompt"
mkdir -p $TMP_DIR/$PROMPT_DIR

# INPUT VARIABLES
#   $1 - Global variable name to write prompt into
#   $2 - Input prompt message for user
#   $3 - Reuse cache prompt message for user
#   $4 - Reuse cache message reminder for user
#   $5 - Valid input message for user
#   $6 - Invalid input message for user
#
#   Example usage:
#
#     promptUserEntry \
#       'gcpProjectID' \
#       'Please input your Google Cloud Platform Project ID:' \
#       'Use the same project id? (Y/n):' \
#       'You previously inputted GCP Project ID as' \
#       'You inputted GCP Project ID as' \
#       'Please input a valid value.'
#
#
# OUTPUT VARIABLES
#   None
#
promptUserEntry(){
  local _outputVar=$1
  local _inputPrompt=$2
  local _reuseCacheValuePrompt=$3
  local _reuseCacheValueMessage=$4
  local _validInputMessage=$5
  local _invalidInputMessage=$6

  local _promptCacheFilename="$TMP_DIR/$PROMPT_DIR/$_outputVar"
  local _reuseCacheDecision=""
  local _userPrompt=""

  if [ -e $_promptCacheFilename ]; then
    _userPrompt=`cat $_promptCacheFilename`
    echo "$_reuseCacheValueMessage \"$_userPrompt\""

    while true; do
      read -p "$(echo $_reuseCacheValuePrompt) " _reuseCacheDecision
      case $_reuseCacheDecision in
        Y|y ) echo ""; eval $_outputVar="'$_userPrompt'"; return 0;;
        N|n ) break;;
        * ) echo $_invalidInputMessage;;
      esac
    done
  fi

  while true; do
    read -p "$(echo $_inputPrompt) " _userPrompt
    case $_userPrompt in
      "") echo $_invalidInputMessage;;
      * ) echo $_userPrompt > $_promptCacheFilename; break;;
    esac
  done
  echo "$_validInputMessage \"$_userPrompt\"\n"

  eval $_outputVar="'$_userPrompt'"
}
