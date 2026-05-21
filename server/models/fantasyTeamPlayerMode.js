const pool = require('../db/pool');

// Adds a player to a team. Returns the updated row.
module.exports.addPlayer = async (team_id, player_id) => {
  const query = `
    INSERT INTO fantasy_teams_players (team_id, player_id)
    VALUES ($1, $2)
    RETURNING *
  `;

  const { rows } = await pool.query(query, [team_id, player_id]);
  return rows[0];
};

// Removes a player from a team. Returns the updated row.
module.exports.removePlayer = async (team_id, player_id) => {
  const query = `
    DELETE FROM fantasy_teams_players
    WHERE team_id = $1
    AND player_id = $2
    RETURNING *
  `;

  const { rows } = await pool.query(query, [team_id, player_id]);
  return rows[0];
};