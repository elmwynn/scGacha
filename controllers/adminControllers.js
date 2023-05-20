//functions to be used by the admin of the bot
const path = require('path');
const {EmbedBuilder} = require('discord.js');
const Player = require('../models/Player');
const characterData = {
    characters: require('../models/characterData.json'),
    setCharacters: function (characterData){
        this.characters = characterData;
    }
};

//pre-condition: admin userID provided
//post-condition: adds requested card to admin deck for testing
const randomAddToDeck = async(userID) => {
    const toAdd = characterData.characters[4][1];
    await Player.findOneAndUpdate(
        {playerId: userID},
        {$push: {characterDeck: toAdd}}
    );
}

//post-condition: resets all users daily roll counts to 0
const resetDailyRollCount = async () => {
    await Player.updateMany(
        {},
        {dailyRollCount: 0}
    );
}

//post-condition: resets all user pity roll counts to 0
const resetPityRollCount = async() => {
    await Player.updateMany(
        {},
        {pityRollCount: 0}
    );
}


//post:syncs the cards from character database to all players
const syncDeck = async(userID) => {
    const result = await Player.find({
        playerId: userID
    })
    const oldCard = result[0].characterDeck[16];
    const newCard = characterData.characters[3][1];
    await Player.updateMany(
        {"characterDeck": oldCard},
        {"$set": {"characterDeck.$": newCard}}
    )   
  
}

//post-condition: adds new fields to player documents
const addNewFieldsToPlayers = async() =>{
    await Player.updateMany(
        {},
        {$set: {"pityRollCount": 1}}
    )
}



module.exports = {
    syncDeck,
    randomAddToDeck,
    resetDailyRollCount,
    addNewFieldsToPlayers,
    resetPityRollCount
}