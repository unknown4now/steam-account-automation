# STEAM ACCOUNT AUTOMATION
This script made for FSM Boost Tool to send friend request bot accounts, from main account and accept the requests automatically.

# Features
* Auto send friend request and accept it
* Getting friend code


# Requirements
* Node.js latest version https://nodejs.org/en
* Libs in bottom

# Installation
```
npm install readline fs steam-user steam-totp
```

# Usage
* In `accounts.txt` add your bot account details login:password format
* Run `install.bat`
* Run `start.bat` to start the script
* In `friendscode.txt` gonna be your friend codes
* To change custom name you need to edit this line
 ```
const str_name = (config.display_format ? config.display_format : "nn ▲ $id$").replace(/\$id\$/g, (idx + 1).toString());
```
