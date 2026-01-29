#!/bin/bash

# Test script to debug bash syntax issues

# Test basic conditionals
if [ "test" = "test" ]
then
    echo "Basic conditional works"
else
    echo "Basic conditional failed"
fi

# Test variable assignments and conditionals
TEST_VAR="test_value"
if [ "$TEST_VAR" != "null" ] && [ "$TEST_VAR" != "" ]
then
    echo "Variable conditional works"
    if [ "$TEST_VAR" = "test_value" ]
    then
        echo "Nested conditional works"
    else
        echo "Nested conditional else works"
    fi
else
    echo "Variable conditional else works"
fi

echo "Script completed successfully"