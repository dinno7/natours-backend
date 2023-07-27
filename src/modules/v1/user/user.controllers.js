const fs = require('fs');
const { uuidv4 } = require('./user.utils');

const usersFilePath = `${__dirname}/../../../static/data/users.json`;
const users = JSON.parse(fs.readFileSync(usersFilePath));

module.exports = {
	getAllUsers: function (req, res) {
		return res.status(200).send({
			ok: true,
			result: users.length,
			data: {
				users,
			},
		});
	},

	getUserById: (req, res) => {
		return res.status(200).send({
			ok: true,
			result: 1,
			data: {
				user: req.foundUser,
			},
		});
	},

	createUser: (req, res) => {
		let newUser = req.body;
		if (!newUser || !Object.keys(newUser).length)
			return res.status(401).send({
				ok: false,
				result: 0,
				message: 'User can not be empty.',
			});
		const userId = uuidv4();

		newUser = { id: userId, ...newUser };

		users.push(newUser);
		fs.writeFile(usersFilePath, JSON.stringify(users), (err) => {
			if (err) {
				return res.status(401).send({ ok: false, message: err.message || 'There is some problem in creating new user.' });
			}

			return res.status(201).send({
				ok: true,
				result: 1,
				data: {
					user: newUser,
				},
			});
		});
	},

	checkUserId: function (req, res, next, userId) {
		let user = users.find((t) => t._id == userId);
		if (!user) return res.status(404).send({ ok: false, message: 'User not found!' });
		req.foundUser = user;
		return next();
	},
};
