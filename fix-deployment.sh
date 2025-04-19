#!/bin/bash

# This script fixes the folder structure to make it compatible with Vercel deployment

# Step 1: Move necessary files from dryad-restoration-app to current directory
if [ -d "./dryad-restoration-app/src" ]; then
    echo "Moving source files from dryad-restoration-app/src to src..."
    # First, backup the existing src folder if it exists
    if [ -d "./src" ]; then
        echo "Backing up existing src folder..."
        mv ./src ./src.backup
    fi
    # Move the src folder from dryad-restoration-app
    mv ./dryad-restoration-app/src ./
    echo "Source files moved successfully."
else
    echo "dryad-restoration-app/src directory not found, skipping..."
fi

# Step 2: Create a .env file if it doesn't exist
if [ ! -f "./.env" ]; then
    echo "Creating .env file..."
    cp ./.env.example ./.env
    echo ".env file created."
fi

# Step 3: Update import paths if necessary
echo "Deployment preparation complete!"
echo "Please commit these changes and deploy to Vercel." 