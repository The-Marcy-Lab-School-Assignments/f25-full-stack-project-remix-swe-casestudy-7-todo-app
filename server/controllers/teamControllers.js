const teamModel = require('../models/teamsModel');
const fantasyTeamPlayersModel = require('../models/fantasyTeamPlayerMode');

module.exports.listTeams = async (req, res, next) => {
  try {
    const teams = await teamModel.listByUser(req.session.user_id);
    res.send(teams);
  } catch (err) {
    next(err);
  }
};

module.exports.createTeam = async (req, res, next) => {
  try {
    const { team_name, formation } = req.body;
    if (!name || !formation) return res.status(400).send({ error: 'Team name and formation are required.' });
    const team = await teamModel.create(team_name, formation, req.session.user_id);
    res.status(201).send(team);
  } catch (err) {
    next(err);
  }
};

module.exports.addPlayerToTeam = async (req, res, next) => {
  try {
    const { team_id } = req.params;
    const { player_id } = req.body;
    const addedPlayer = await fantasyTeamPlayersModel.addPlayer(team_id, player_id);
    res.status(201).send(addedPlayer);
  } catch (err) {
    next(err);
  }
};

module.exports.removePlayerFromTeam = async (req, res, next) => {
  try {
    const { team_id, player_id } = req.params;
    const removedPlayer = await fantasyTeamPlayersModel.removePlayer(team_id, player_id);
    res.send(removedPlayer);
  } catch (err) {
    next(err);
  }
};
