require("../Globals");

/**
 * Add +rep for the specefied user
 * @extends {command}
 */
class AddRep extends Command
{
	constructor()
	{
		// Helptext values
		let name  = `++rep`;
		let desc  = `Give a user +1 rep`;
		let usage = `++rep <@user> [reason]`;
		let help  = ``;

		// Activation command regex
		let command = /^\+\+rep(?: (?:[^ ]+))?(?: (.+))?$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		let action = (message, resolve, reject) =>
		{
			let mention = message.mentions.users.array()[0];
			let userid = mention ? mention.id : undefined || message.author.id;
			let userRaw = mention ? `${mention.username}#${mention.discriminator}` :
					undefined || `${message.author.username}#${message.author.discriminator}`;
			let text = message.content.match(this.command)[1];

			// If user tries to rep themselves
			if (userid == message.author.id)
			{
				// Mock user
				message.channel.sendMessage("What kind of loser tries to give rep to themselves?")
					.then(message =>
					{
						message.delete(5 * 1000);
					});
				return;
			}

			// Template for a reps object
			let repsTemplate =
			{
				id: message.author.id,
				raw: `${message.author.username}#${message.author.discriminator}`,
				reason: text || "",
				type: "+",
				time: `${Time.parse(message.timestamp)}`
			}

			// Template for fresh user
			let template =
			{
				id: userid,
				raw: userRaw,
				goodrep: 1,
				badrep: 0,
				reps: [repsTemplate]
			}

			// Get users from db or create users array if it doesn't exist
			try
			{
				var users = this.bot.db.getData("/users");
			}
			catch (e)
			{
				this.bot.db.push("/users", [], true);
				var users = this.bot.db.getData("/users");
			}

			// Find user, increment goodrep and push reps object
			let foundUser = false;
			users.forEach( (user, index) =>
			{
				if (user.id == userid)
				{
					foundUser = true;

					// Check if message author has repped this person before
					let repped = false;
					let reppedTime = 0;
					user.reps.forEach( (key, index) =>
					{
						if (key.id == message.author.id && Time.Difference(settings.cooldown * 1000 * 60 * 60, Time.now() - key.time).ms > 0)
						{
							repped = true;
							reppedTime = key.time;
							return;
						}
					})

					// Message author has repped this user within cooldown, notify and break
					if (repped)
					{
						message.channel.sendMessage(
							`You have already given rep to that user today.\n` +
							`You may give that user rep again in:\n\n` +
							`**${Time.Difference(settings.cooldown * 1000 * 60 * 60, Time.now() - reppedTime).toString()}.**`)
								.then(message =>
								{
									message.delete(5 * 1000);
								});
						return;
					}

					// Increment rep, push repsTemplate and push users to DB
					user.goodrep++;
					user.reps.push(repsTemplate)
					this.bot.db.push(`/users`, users, true);

					// Notify user of successful rep;
					message.channel.sendMessage(
						`${message.author.username}#${message.author.discriminator} gave +1 rep to ${user.raw}`)
							.then(message =>
							{
								message.delete(5 * 1000);
							});
				}
			});

			// Could not find user. Template a new entry with 1 goodrep
			if (!foundUser)
			{
				this.bot.db.push("/users[]", template, true);

				// Notify message author of successful rep;
				this.bot.fetchUser(userid).then(user =>
				{
					message.channel.sendMessage(
						`${message.author.username}#${message.author.discriminator} gave +1 rep to ${user.username}#${user.discriminator}`)
							.then(message =>
							{
								message.delete(5 * 1000);
							});
				})
			}
		}

		// Pass params to parent constructor
		super(command, action, name, desc, usage, help);
	}
}

module.exports = AddRep;
