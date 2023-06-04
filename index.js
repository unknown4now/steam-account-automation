const readline = require('readline');
const fs = require('fs');
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const user = new SteamUser(); // Creating a new instance of the SteamUser class
const accounts = []; // An array to store the account information
const id3s = []; // An array to store Steam3 rendered IDs

// Reading and parsing the accounts file
fs.readFileSync("accounts.txt").toString().split(/\r\n|\r|\n/).forEach((line) => {
    const a = line.split(":");
    if (a.length !== 2) {
        throw new Error("Invalid accounts file format.");
    }

    accounts.push({
        "login": a[0],
        "password": a[1]
    });
});

console.log("%d Account(s) successfully loaded.\n", accounts.length);

rl.question('Enter your main account login: ', (mainLogin) => {
    rl.question('Enter your main account password: ', (mainPassword) => {
        console.log("Logging in now!");

        user.logOn({
            accountName: mainLogin,
            password: mainPassword
        });
    });
});

const work = async (idx) => {
    return new Promise((resolve, reject) => {
        console.log('Logging onto Slave #%d', idx + 1);

        const botLogin = accounts[idx].login;
        const botPassword = accounts[idx].password;

        const bot = new SteamUser(); // Creating a new instance of the SteamUser class for bot account

        bot.logOn({
            accountName: botLogin,
            password: botPassword
        });

        bot.on('loggedOn', async () => {
            console.log("Logged onto %s", bot.steamID.getSteamID64());
            console.log('Sending a friend request now.\n');

            id3s.push(bot.steamID.getSteam3RenderedID().slice(5, -1));

            await user.addFriend(bot.steamID).catch(() => {});
            await bot.addFriend(user.steamID).catch(() => {});

            const str_name = (config.display_format ? config.display_format : "nn ▲ $id$").replace(/\$id\$/g, (idx + 1).toString());

            console.log('Changing name to %s', str_name);

            bot.setPersona(SteamUser.EPersonaState.Online, str_name);

            console.log('Done.\n');

            bot.logOff();
        });

        bot.on('disconnected', () => {
            bot.removeAllListeners();
            resolve("done");
        });
    });
};

const loggedOn = async () => {
    console.log('Logged on as %s\n', user.steamID.getSteamID64());

    id3s.push(user.steamID.getSteam3RenderedID().slice(5, -1));

    for (let i = 0; i < accounts.length; i++) {
        await work(i);
    }

    console.log("Successfully finished!");

    user.removeAllListeners();
    user.logOff();

    const logins = accounts.map((account, index) => `login${index + 1}=${account.login}`).join('\n');
    const passwords = accounts.map((account, index) => `password${index + 1}=${account.password}`).join('\n');
    const steamids = accounts.map((account, index) => `steamid${index + 1}=${id3s[index]}`).join('\n');

    const accountLines = `${logins}\n\n${passwords}\n\n${steamids}`;
    fs.writeFileSync('info.txt', accountLines);

    rl.close();
    return;
};

const steamGuard = async (domain, callback) => {
    return new Promise((resolve) => {
        rl.stdoutMuted = true;

        rl.question('Enter your Steam Guard code: ', (steamGuardCode) => {
            rl.stdoutMuted = false;
            rl.pause();
            const authCode = SteamTotp.generateAuthCode(steamGuardCode.trim()).slice(0, 5);
            callback(authCode);
            resolve();
        });

        rl._writeToOutput = function _writeToOutput(stringToWrite) {
            if (rl.stdoutMuted)
                rl.output.write("*");
            else
                rl.output.write(stringToWrite);
        };
    });
};

const err = (error) => {
    user.removeAllListeners();
    throw error;
};

user.on('error', err);
user.on('loggedOn', loggedOn);

const config = {
    "login": "",
    "password": "",
    "shared_secret": "",
};

if (config.shared_secret && config.shared_secret !== "") {
    user.on('steamGuard', steamGuard); // Set up event listener for Steam Guard code input
}
