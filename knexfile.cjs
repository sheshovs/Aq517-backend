// Update with your config settings.
const dotenv = require("dotenv");
dotenv.config();
const {
  DATABASE_NAME,
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
} = process.env;
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "pg",
    connection: {
      host: DATABASE_HOST,
      port: Number(DATABASE_PORT),
      user: DATABASE_USER,
      password: DATABASE_PASSWORD,
      database: DATABASE_NAME,
      // ssl: { rejectUnauthorized: false, require: true }
    },
    searchPath: [DATABASE_NAME],
    pool: {
      min: 0,
      max: 5,
      afterCreate: (conn, done) => {
        console.log("Conexión establecida en local.");
        done();
      },
    },
  },
  production: {
    client: "pg",
    connection: {
      host: DATABASE_HOST,
      port: Number(DATABASE_PORT),
      user: DATABASE_USER,
      password: DATABASE_PASSWORD,
      database: DATABASE_NAME,
      ssl: { rejectUnauthorized: false, require: true }
    },
    searchPath: [DATABASE_NAME],
    pool: {
      min: 0,
      max: 5,
      afterCreate: (conn, done) => {
        console.log("Conexión establecida en producción.");
        done();
      },
    },
  },
};
