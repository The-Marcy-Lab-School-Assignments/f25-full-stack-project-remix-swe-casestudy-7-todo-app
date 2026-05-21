const pool = require('../db/pool');

// Returns all teams for a specific user, ordered by creation time
module.exports.listByUser = async (user_id) => {
  const query = 'SELECT * FROM fantasy_teams WHERE user_id = $1 ORDER BY team_id ASC';
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

// Returns a single team row (used for ownership checks before update/delete)
module.exports.find = async (team_id) => {
  const query = 'SELECT * FROM fantasy_teams WHERE team_id = $1';
  const { rows } = await pool.query(query, [team_id]);
  return rows[0] || null;
};

// Creates a new team. Returns the full team row.
module.exports.create = async (user_id, team_name, formation) => {
  const query =
    `INSERT INTO fantasy_teams (user_id, team_name, formation) 
    VALUES ($1, $2, $3) 
    RETURNING *
  `;

  const { rows } = await pool.query(query, [user_id, team_name, formation]);
  return rows[0];
};

// Deletes a todo by id
module.exports.destroy = async (team_id) => {
  const query = 'DELETE FROM fantasy_teams WHERE team_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [team_id]);
  return rows[0] || null;
};
