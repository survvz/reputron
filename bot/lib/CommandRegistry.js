/**
 * An array wrapper for initializing commands without having to create
 * individual variables for each command. This provides a clearer syntax
 * for what is being done when initializing commands.
 * @extends {Array}
 */
class CommandRegistry extends Array
{
	/**
	 * @param {Bot} bot Discord.js client instance
	 */
	constructor(bot)
	{
		super();
		this.bot = bot;
		this.info = {};

		// Handle execution of commands
		this.bot.on("message", (message) =>
		{
			// Not a command, break
			if (!message.content.startsWith("??rep") &&
				!message.content.startsWith("++rep") &&
				!message.content.startsWith("--rep") &&
				!message.content.startsWith("rep")) return;

			// Prevent bot messages triggering commands
			if (message.author.bot) return;

			// Respond only to admin's commands
			// if (message.author.id !== settings.admin) return;

			// Check for command matches and execute the
			// appropriate command action
			let command = message.content;
			this.forEach( (item) =>
			{
				if (item instanceof Command)
				{
					if (command.match(item.command))
					{
						item.DoAction(message).then( (result) =>
						{
							this.bot.Say(result);
						}, (err) =>
						{
							this.bot.Say(err.stack ? err.stack.red : err.red);
						});
					}
				}
			});
		})
	}

	/**
	 * Pass the Bot instance to the given command, add
	 * command to parent Array, and push command helptext
	 * fields to the info array for helpdocs
	 * @param {Command} command Command to be registered
	 * @returns {null}
	 */
	Register(command)
	{
		command.Register(this.bot);
		this.push(command);
		this.info[command.name] =
		{
			desc: command.desc,
			usage: command.usage,
			help: command.help,
			alias: command.alias,
			admin: command.admin || false
		}
	}
}

module.exports = CommandRegistry;
