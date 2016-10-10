let Command = require('yamdbf').Command;

exports.default = class CheckRep extends Command
{
    constructor(bot)
    {
        super(bot, {
            name: '??rep',
            aliases: [],
            description: 'Check the rep of the mentioned user or yourself',
            usage: '??rep [@user]',
            group: 'base',
            guildOnly: true
        });
    }

    action(message, args, mentions, original) // eslint-disable-line no-unused-vars
    {
		try
		{
			let user = mentions[0] || message.author;
			let storage = this.bot.guildStorages.get(message.guild);
			let rep = storage.getItem(user.id);
			if (!rep)
			{
				message.channel.sendMessage(`That user has no rep.`)
					.then(response =>
					{
						response.delete(5 * 1000);
					});
				return;
			}
			var output = '';
			this.bot.fetchUser(user.id).then(u =>
			{
				output += `${u.username}#${u.discriminator} has (+${rep.goodrep}|-${rep.badrep}) reputation\n`;
				rep.reps.forEach( (item) =>
				{
					output += `**(${item.type})** ${item.repper}${item.reason === '' ? '' : ': '}${item.reason}\n`;
				});

				message.channel.sendMessage(output)
					.then(response =>
					{
						response.delete(5 * 1000);
					});
				return;
			}).catch(console.log);
		}
		catch (err)
		{
			console.error(err);
		}
    }
};
