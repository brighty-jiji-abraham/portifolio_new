// PM2 process file for the production server (brighty.pro).
// First time:   npm ci && npm run build:server && pm2 start ecosystem.config.cjs && pm2 save
// After a pull: bash deploy/deploy.sh   (builds into a new folder, swaps it in, reloads this app)
// nginx forwards brighty.pro here (deploy/nginx/brighty.pro.conf); the app is never exposed directly.
// The file is .cjs because package.json sets "type": "module" and PM2 loads this file with require().
module.exports = {
  apps: [
    {
      name: "brighty-portfolio",
      // Dependency-free static server for dist/ (MIME types, byte ranges for audio, cache headers).
      script: "server/serve.mjs",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
      // Give running downloads time to finish on reload/stop.
      kill_timeout: 5000,
      env: {
        NODE_ENV: "production",
        // Listen on localhost only: nginx is the only thing that talks to the app.
        HOST: "127.0.0.1",
        // 3001-3013 are taken by the other sites on this server.
        PORT: "3014",
      },
    },
  ],
};
