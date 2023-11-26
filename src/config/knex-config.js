import knex from 'knex'
import config from '../../knexfile.cjs'

const pg = knex(config.development)

export default pg