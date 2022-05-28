const config = require('./config.json');
const dedent = require('dedent-js')
const freeWill = require('./free_will.js');
const speech = require('./speech.js');

function start() {
	speech.load();
}

function process(msg) {
	if (msg.author.bot) {
		return;
	}

	if (config.ignoredChannels.includes(msg.channel.name)) {
		return;
	}

	for (const reaction of config.predefinedReactions) {
		var regexp = new RegExp(reaction[0]);
		if (regexp.test(msg.content)) {
			msg.channel.send(reaction[1]);
			return;
		}
	}

	if (speech.amIMentioned(msg)) {
		if (speech.isQuestionAboutPerson(msg.content)) {
			speech.choosePerson(msg.guild).then(
				response => msg.channel.send(response)
			);
		} else if (speech.isYesOrNoQuestion(msg.content)) {
			msg.channel.send(speech.answerYesOrNo());
		} else if (speech.isDumpRequest(msg.content)) {
			msg.channel.send(dump());
		} else {
			msg.channel.send(speech.talk());
		}
	} else {
		speech.learn(msg.content);

		if (freeWill.wantToTalk()) {
			msg.channel.send(speech.talk());
		}
	}
}

function dump() {
	return dedent`
		SPEECH:
		${speech.dump()}

		FREE WILL:
		${freeWill.dump()}
	`;
}

function save() {
	speech.save();
}

module.exports.start = start;
module.exports.process = process;
module.exports.save = save;
