#!/bin/bash
# Command To Release Build
# sudo sh scripts/build_prod.sh

# default variable and function start
RED='\033[0;31m'    # Red
GREEN='\033[0;32m'  # Green
YELLOW='\033[0;33m' # Yellow
BLUE='\033[0;34m'   # Blue
NC='\033[0m'        # Reset color to default

function printSuccess() {
  args="$1"
  echo "${GREEN}$args${NC}" 
}
# default variable and function end

# Define the source and destination directories
source_dir="dist/gm-frontend/browser"
destination_dir="docs"

rm -rf "$source_dir"
rm -rf "$destination_dir"

ng build --configuration production --base-href /gm-frontend/

# Check if the source directory exists
if [ ! -d "$source_dir" ]; then
  echo "Source directory does not exist."
  exit 1
fi

# Check if the destination directory exists; create if not
if [ ! -d "$destination_dir" ]; then
  mkdir -p "$destination_dir"
fi

# Move all files and subdirectories from source to destination
for item in "$source_dir"/*; do
  mv "$item" "$destination_dir"
done

cp "$destination_dir/index.html" "$destination_dir/404.html"

rm -rf "$source_dir"

printSuccess "Contents of $source_dir moved to $destination_dir"
printSuccess "Success!"

