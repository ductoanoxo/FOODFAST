#!/bin/bash

# Script để trigger export-cicd-metrics workflow thủ công
# Cần GitHub CLI (gh) hoặc trigger qua web UI

echo "🚀 To trigger export-cicd-metrics workflow manually:"
echo ""
echo "Method 1 - Using GitHub CLI:"
echo "  gh workflow run export-cicd-metrics.yml --ref kiet"
echo ""
echo "Method 2 - Using Web UI:"
echo "  1. Go to: https://github.com/ductoanoxo/FOODFAST/actions/workflows/export-cicd-metrics.yml"
echo "  2. Click 'Run workflow' button"
echo "  3. Select branch: kiet"
echo "  4. Click 'Run workflow'"
echo ""
echo "Method 3 - Using GitHub API:"
echo "  curl -X POST \\"
echo "    -H \"Accept: application/vnd.github+json\" \\"
echo "    -H \"Authorization: Bearer YOUR_GITHUB_TOKEN\" \\"
echo "    https://api.github.com/repos/ductoanoxo/FOODFAST/actions/workflows/export-cicd-metrics.yml/dispatches \\"
echo "    -d '{\"ref\":\"kiet\"}'"
echo ""
echo "⏳ After workflow completes, check metrics:"
echo "  bash check-real-metrics.sh"
