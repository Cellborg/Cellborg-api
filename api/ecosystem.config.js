module.exports = {
  apps : [{
    name: 'API',
    script: 'src/index.js',
    instances: 'max',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
};