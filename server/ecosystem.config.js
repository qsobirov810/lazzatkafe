module.exports = {
    apps: [{
        name: "kafe-epos-server",
        script: "./index.js",
        watch: false,
        env: {
            NODE_ENV: "production",
            PORT: 3000
        },
        instances: 1,
        exec_mode: "fork",
        max_memory_restart: '200M',
        error_file: "./logs/err.log",
        out_file: "./logs/out.log",
        log_date_format: "YYYY-MM-DD HH:mm:ss"
    }]
};
