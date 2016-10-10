let Command = require('yamdbf').Command;
let Time = require('../Time');

exports.default = class AddRep extends Command
{
    constructor(bot)
    {
        super(bot, {
            name: '++rep',
            aliases: [],
            description: 'Give positive rep to a user',
            usage: '++rep <@user>',
            group: 'base',
            guildOnly: true
        });
    }

    action(message, args, mentions, original) // eslint-disable-line no-unused-vars
    {
		try
		{
			let mention = mentions[0];
	        if (!mention)
			{
				message.channel.sendMessage(`You must mention a user to give rep to.`)
					.then(response =>
					{
						response.delete(5 * 1000);
					});
				return;
			}
			if (mention.id === message.author.id)
			{
				message.channel.sendMessage(`You cannot give rep to yourself.`)
					.then(response =>
					{
						response.delete(5 * 1000);
					});
				return;
			}

			let repItemTemplate = {
				repper: `${message.author.username}#${message.author.discriminator}`,
				reason: args.join(' '),
				type: '+'
			}

			let cooldownTemplate ={
				user: message.author.id,
				time: Time.parse(message.timestamp)
			}

			let storage = this.bot.guildStorages.get(message.guild);
			let cooldown, reppedBefore;

			// User has not been repped before
			if (!storage.getItem(mention.id))
			{
				let template = JSON.parse(JSON.stringify(this.bot.repTemplate));
				template.goodrep++;
				template.reps.push(repItemTemplate);
				template.cooldowns.push(cooldownTemplate);
				storage.setItem(mention.id, template);
			}
			else
			{
				let rep = storage.getItem(mention.id);
				reppedBefore = rep.cooldowns.filter(a => a.user === message.author.id).length > 0;
				if (reppedBefore) cooldown = rep.cooldowns.filter(a => a.user === message.author.id)[0].time;

				// Check if under cooldown period
				if (reppedBefore && Time.Difference(24 * 1000 * 60 * 60, Time.now() - cooldown).ms > 0)
				{
					message.channel.sendMessage(
						`You have already given rep to that user today.\n` +
						`You may give that user rep again in:\n\n` +
						`**${Time.Difference(24 * 1000 * 60 * 60, Time.now() - cooldown).toString()}.**`)
							.then(message =>
							{
								message.delete(5 * 1000);
							});
					return;
				}
				// Remove expired cooldowns
				else if (reppedBefore && Time.Difference(24 * 1000 * 60 * 60, Time.now() - cooldown).ms < 1)
				{
					rep.cooldowns.forEach((c, i) =>
					{
						if (c.user === message.author.id) rep.cooldowns.splice(i, 1);
					});
					reppedBefore = false;
				}

				rep.goodrep++;
				rep.reps.push(repItemTemplate);
				rep.cooldowns.push(cooldownTemplate);
				if (rep.reps.length > 5) rep.reps.shift();
				storage.setItem(mention.id, rep);
			}
			if (reppedBefore) return;

			message.channel.sendMessage(`${message.author.username}#${message.author.discriminator} gave +1 rep to ${mention.username}#${mention.discriminator}`)
				.then(response =>
				{
					response.delete(5 * 1000);
				});
			return;
		}
		catch (err)
		{
			console.error(err);
		}
    }
};
