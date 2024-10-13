#!/bin/sh

# INPUT VARIABLES
#   $1 - Command to execute
#
# OUTPUT VARIABLES
#   None
#
echoAndRun(){
    echo "${ECHO_GREEN_COLOR}Running${ECHO_NO_COLOR} \"$1\""
    $1
    echo ""
}

echoWithColor(){
    echo "${ECHO_GREEN_COLOR}$1${ECHO_NO_COLOR}"
}
