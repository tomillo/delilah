module.exports = {
    database: {
        host: process.env.DB_HOST || '192.168.64.2',
        port: process.env.DB_PORT || 3306,
        username: process.env.DB_USER || 'tomillo2',
        password: process.env.DB_PASS || 'password',
        database: process.env.DB_DATABASE || 'delilah_resto',
    }
}