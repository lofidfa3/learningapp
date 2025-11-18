// PM2 Ecosystem Configuration for Production
module.exports = {
  apps: [
    {
      name: 'learningapp',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/learningapp', // Update this to your deployment path
      instances: 1, // Use 'max' for cluster mode, or number for specific instances
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false, // Set to true for development, false for production
    },
  ],
};

