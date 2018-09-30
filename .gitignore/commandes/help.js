module.exports = class CmdHelp
{
	static action (channelBot, message, args)
	{
		if(args.length < 2 || args[1] == "")
		{
			message.channel.send(	"------------------help------------------\n"+
									"  Disponible uniquement dans le channel "+channelBot+"\n"+
									"  ping : retourne pong\n"+
									"  id : retourne votre ID Discord\n"+
									//"  \n"+
									//"  \n"+
									//"  \n"+
									//"  \n"+
									//"  \n"+
									//"  \n"+
									"----------------------------------------");
		}
		else
		{
			switch(args[1])
			{
				case "help":
					message.channel.send("Donne la liste des commandes disponnibles\n!help [commande] pour détailler la commande");
					break;

				case "ping":
					message.channel.send("Ne fait que vous retourner \"pong\", utile pour tester le ping entre 2 bots");
					break;

				case "id":
					message.channel.send("Retourne votre ID Discord (Snowflake => https://discord.js.org/#/docs/main/stable/typedef/Snowflake)");
					break;
			}
		}
	}
}
