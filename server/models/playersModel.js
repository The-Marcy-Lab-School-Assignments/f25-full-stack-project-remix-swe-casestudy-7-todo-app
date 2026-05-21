const pool = require('../db/pool');

// Returns all listed players
module.exports.listAllPlayers = async () => {
    const query = 'SELECT * FROM players ORDER BY player_id, player_name ASC';
    const { rows } = await pool.query(query);
    return rows;
};

// Returns a single player_name row
module.exports.findByName = async (player_name) => {
    const query = 'SELECT * FROM players WHERE player_name = $1';
    const { rows } = await pool.query(query, [player_name]);
    return rows;
};

// Returns a single player_id row
module.exports.findByID = async (player_id) => {
    const query = 'SELECT * FROM players WHERE player_id = $1';
    const { rows } = await pool.query(query, [player_id]);
    return rows[0] || null;
};