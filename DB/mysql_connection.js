const Sequelize = require('sequelize');
const config = require('./config');

const {host, port, username, password, database} = config.database;

const sequelize = new Sequelize ({
    username,
    database,
    password,
    host,
    port,
    dialect: 'mysql',
    logging: false
})

const init = async () => {
    console.log('conectando a la DB...');
    return sequelize.authenticate();
}

const query = async (q) => {
    try {
      const [rows] = await sequelize.query( q, 
                                    {
                                      raw: true, 
                                      plain: false, 
                                      logging: false
                                    });
      return rows;
    } catch (err) {
      return Promise.reject(err);
    }
}
module.exports = {init, query, sequelize, Sequelize};