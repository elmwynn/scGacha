This repository contains the code for an SC-themed gacha discord bot.
Allows for the creation of player characters to be stored in database.
Players can roll for characters in the character database, upgrade characters,
and burn characters for more rolls.

Player information is stored in a mongooose database (configuration for connection is in the config folder), while character data/information is stored in a JSON file since updates to character info are not frequent. Information for all of this is located in the models folder. 

Functions to control player, character, and admin information is located in the controllers folder.

Project start date: 05-18-2023