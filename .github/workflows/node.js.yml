name: Node.js CI and Deploy

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

permissions:
  contents: read

# Cancel superseded runs on the same ref so only the newest deploy goes live
concurrency:
  group: pages-${{ github.ref }}
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node-version: [20.x, 22.x]
    steps:
      - uses: actions/checkout@v5

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v5
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci

      - run: npm run build

      # Only the 22.x leg, on push to main, uploads the artifact for the deploy job
      - name: Upload Pages artifact
        if: github.event_name == 'push' && github.ref == 'refs/heads/main' && matrix.node-version == '22.x'
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write       # required to publish to Pages
      id-token: write    # required for OIDC auth used by deploy-pages
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
