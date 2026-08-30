#!/bin/bash
# 
# PomoMate Documentation Generator
# Converts Markdown documentation into PDF/DOCX formats using pandoc.
# 
# Requirements:
# - pandoc (https://pandoc.org/installing.html)
# - pdflatex (for PDF generation)

set -e

DOCS_DIR="./docs"
OUTPUT_DIR="./docs/build"

echo "Generating documentation formats..."

mkdir -p "$OUTPUT_DIR"

for file in "$DOCS_DIR"/*.md; do
  if [ -f "$file" ]; then
    filename=$(basename -- "$file")
    name="${filename%.*}"
    
    echo "Processing $name..."
    
    # Generate PDF
    # pandoc "$file" -o "$OUTPUT_DIR/$name.pdf" --pdf-engine=pdflatex -V geometry:margin=1in
    
    # Generate HTML
    pandoc "$file" -o "$OUTPUT_DIR/$name.html" --standalone
    
    # Generate DOCX
    # pandoc "$file" -o "$OUTPUT_DIR/$name.docx"
  fi
done

echo "Documentation generated in $OUTPUT_DIR"
echo "Note: PDF and DOCX generation is commented out by default."
echo "Uncomment the lines in the script and ensure pandoc/LaTeX is installed."
