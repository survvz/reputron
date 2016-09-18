require("../Globals");

/**
 * Check the rep of the user or the provided user by mention
 * @extends {command}
 */
class CheckRep extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Check rep for the provided user, or yourself`;
		let alias = `??rep`;
		let usage = `??rep [@user]`;
		let help  = `To check your own rep, don't mention any user in the command.`;

		// Activation command regex
		let command = /^\?\?rep(?: (.+))?$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		let action = (message, resolve, reject) =>
		{
			let userid = message.mentions.users.array()[0] ?
				message.mentions.users.array()[0].id : undefined || message.author.id;

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

			// Find the user in db
			let foundUser = false;
			users.forEach( (user, index) =>
			{
				if (user.id == userid)
				{
					foundUser = true;
					let reps = user.reps;

					// Build output and send to channel
					this.bot.fetchUser(userid).then(u =>
					{
						let output = `${u.username}#${u.discriminator} has (+${user.goodrep}|-${user.badrep}) reputation\n`;
						reps.forEach( (item) =>
						{
							output += `**(${item.type})** ${item.raw}: _${item.reason == "" ? " " : item.reason}_\n`;
						});

						// Send output to channel, delete after 5 seconds
						message.channel.sendMessage(output)
							.then(message =>
							{
								message.delete(5 * 1000);
							});
					});
				}
			})

			if (!foundUser)
			{
				// Send message for no rep
				this.bot.fetchUser(userid).then(user =>
				{
					message.channel.sendMessage(`${user.username}#${user.discriminator} has no rep. :(`)
						.then(message =>
						{
							message.delete(5 * 1000);
						});
				});
			}


		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help, alias);
	}
}

module.exports = CheckRep;
