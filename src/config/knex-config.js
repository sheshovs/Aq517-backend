import knex from "knex";
import config from "../../knexfile.cjs";
import dotenv from "dotenv";
dotenv.config();
const {
  ENV
} = process.env;

const pg = knex(ENV === "local" ? config.development : config.production);

export default pg;
