require("../Globals");

/**
 * Description
 * @extends {command}
 */
class CommandName extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Check rep for the provided user, or yourself`;
		let alias = `??rep`;
		let usage = `??rep [@user]`;
		let help  = `To check your own rep, don't mention any user in the command.`;

		// Activation command regex
		let command = /^??rep$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		let action = (message, resolve, reject) =>
		{
			let userid = message.mentions.users.array()[0].id;

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

			
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help, alias);
	}
}

module.exports = CommandName;
