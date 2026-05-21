const playerModel = require('../models/playersModel');

module.exports.listPlayers = async (req, res, next) => {
    try {
        const players = await playerModel.listAllPlayers(req.session.user_id);
        res.send(players);
    } catch (err) {
        next(err);
    }
};

module.exports.getPlayer = async (req, res, next) => {
    try {
        const player = await playerModel.findByName(req.session.user_id);
        res.send(player);
    } catch (err) {
        next(err);
    }
};