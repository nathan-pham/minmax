import readline from "readline";

const prompt = (query) => {
    return new Promise((resolve) => {
        const rl = readline.createInterface(process.stdin, process.stdout);
        rl.question(query, (input) => {
            rl.close();
            resolve(input);
        });
    });
};

export default prompt;
