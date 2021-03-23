const { program } = require("@caporal/core");
const { version } = require("../package.json");

const got = require("got");
const defaultApiUrl = "http://snakeroom.github.io/Snakedex";

const debug = require("debug");
const log = require("./utils/debug.js");

const defaultDebugger = "snakedex-cli:*";
debug.enable(defaultDebugger);

program.version(version);

// Global options
program.option("--api-url [api-url]", "The base URL for the Snakedex API.", {
	default: defaultApiUrl,
	global: true,
	validator: program.STRING,
})
program.option("--debug [debug]", "Debuggers to enable.", {
	default: defaultDebugger,
	global: true,
	validator: program.STRING,
	action: ({ options }) => {
		debug.enable(options.debug);
	}
});

// Commands
program
	.command("get", "Gets information about a specific snake.")
	.argument("<snake-number>", "The snake number of the snake to get.", {
		validator: program.NUMBER,
	})
	.action(async ({ args }) => {
		if (!args.apiUrl) {
			args.apiUrl = defaultApiUrl;
		} else if (args.apiUrl.endsWith("/")) {
			args.apiUrl = args.apiUrl.slice(0, args.apiUrl.length - 1);
		}
		log("running program with options: %O", args);

		const bySnakeNumberUrl = args.apiUrl + "/listing/by_snake_number.json";
		log("retrieving snakes by snake number from %s", bySnakeNumberUrl);

		const response = await got.get(bySnakeNumberUrl, {
			responseType: "json",
		});
		const snakes = response.body.snakes;

		const snake = snakes[args.snakeNumber];
		if (!snake) {
			log("could not find any snake with snake number %d", args.snakeNumber);
			return;
		}

		log("found snake with snake number %d: %O", args.snakeNumber, snake);
	});

program
	.command("list", "Gets a list of all snakes.")
	.action(async ({ args }) => {
		if (!args.apiUrl) {
			args.apiUrl = defaultApiUrl;
		} else if (args.apiUrl.endsWith("/")) {
			args.apiUrl = args.apiUrl.slice(0, args.apiUrl.length - 1);
		}
		log("running program with options: %O", args);

		const allUrl = args.apiUrl + "/listing/all.json";
		log("retrieving all snakes from %s", allUrl);

		const response = await got.get(allUrl, {
			responseType: "json",
		});
		const snakes = response.body.snakes;

		for (const snake of snakes) {
			const snakeNumber = snake.snakeNumber.toString().padStart(4);
			log("%s. %s (%s)", snakeNumber, snake.name, snake.id);
		}
	});

program.run(process.argv.slice(2));
