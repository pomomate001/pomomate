// PomoMate — PM2 Ecosystem Configuration
// For production deployment on Abacus SuperComputer

module.exports = {
  apps: [
    {
      name: 'pomomate-backend',
      script: './server/dist/index.js',
      cwd: '/home/ubuntu/pomomate',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '.env.production',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
