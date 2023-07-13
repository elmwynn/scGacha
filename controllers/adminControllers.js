//functions to be used by the admin of the bot
const path = require('path');
const {EmbedBuilder} = require('discord.js');
const Player = require('../models/Player');
const { all } = require('axios');
const characterData = {
    characters: require('../models/temp.json'),
    setCharacters: function (characterData){
        this.characters = characterData;
    }
};

//pre-condition: admin userID provided
//post-condition: adds requested card to admin deck for testing
const randomAddToDeck = async(userID, cardNumber) => {
    const addCard = characterData.characters[cardNumber-1];
    await Player.findOneAndUpdate(
        {playerId: userID},
        {$push: {characterDeck: addCard}}
    );
}

const getAllPlayerIDs = async() =>{
    const result = await Player.find();
    const idArray = [];
    for(let i = 0; i < result.length; i++)
        idArray.push(result[i].playerId);
    return idArray;
}

const reInitializePoints = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    let addPoints = 0;
    for(let i =0 ; i < result[0].characterDeck.length; i++){
        if(result[0].characterDeck[i].ranking === '✦')
            addPoints += 1;
        else if(result[0].characterDeck[i].ranking === '✦ ✦')
            addPoints += 2;
        else if(result[0].characterDeck[i].ranking === '✦ ✦ ✦')  
            addPoints +=5;
        else if(result[0].characterDeck[i].ranking === '✦ ✦ ✦ ✦')  
            addPoints += 10;
        else if(result[0].characterDeck[i].ranking === '✦ ✦ ✦ ✦ ✦')  
            addPoints += 15;
        else
            addPoints+=20;
    }

    addPoints += (result[0].gifts.length)*50;
    await Player.findOneAndUpdate(
        {playerId: userID},
        {points: addPoints}
    )
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



const getID = () =>{
    const allCharacters=characterData.characters;
    for(let i = 0; i < allCharacters.length; i++)
        for(let k = i+1; k < allCharacters.length-1; k++)
            if(allCharacters[i].id === allCharacters[k].id)
                console.log(allCharacters[i].id);
}
const burnAll = async(userID) =>{
    const result = await Player.find(
        {playerId: userID}
    )
    for(let i = 0; i< result[0].characterDeck.length; i++){
        await Player.findOneAndUpdate(
            {playerId: userID},
            {$pull : {characterDeck: result[0].characterDeck[i]}}
        )
    }
}

const addAll = async(userID) => {
    const allCharacters = characterData.characters;
    for(let i = 0; i < allCharacters.length; i++){
        await Player.findOneAndUpdate(
            {playerId: userID},
            {$push : {characterDeck: allCharacters[i]}}
        )
    }
}
const sameCard = (dataCard, playerCard) => {
    if(dataCard.name !== playerCard.name)
        return false;
    if(dataCard.upgradeCount !== playerCard.upgradeCount)
        return false;
    if(dataCard.ranking !== playerCard.ranking)
        return false;
    if(dataCard.upgradeDialogue)
        if(!playerCard.upgradeDialogue)
            return false;
    if(JSON.stringify(dataCard.upgradeDialogue) !== JSON.stringify(playerCard.upgradeDialogue))
        return false;
    return true;   
}


//post-condition:syncs the cards from character database to selected players
const syncDeck = async(userID) => {
    const result = await Player.find({
        playerId: userID
    });
    const allCharacters = characterData.characters;
    let keepUpgradeCount;
    for(let i = 0; i < result[0].characterDeck.length; i++){
    //loop through player deck
        for(let k = 0; k < allCharacters.length; k++)
        //loop through main data deck
            if(result[0].characterDeck[i].id === allCharacters[k].id){
                //if the card id for player deck matches card id for main deck
                const oldCard = result[0].characterDeck[i];
                //set oldCard
                const updatedCard = allCharacters[k];
                //set new card
                if(sameCard(updatedCard, oldCard))
                    //if the cards are the same, no need to update
                    //continue
                    continue;
                if(oldCard.upgradeDialogue){
                //if upgrade count exists, store old upgrade count
                    keepUpgradeCount = oldCard.upgradeCount;
                    updatedCard.upgradeCount = keepUpgradeCount;
                    const keepRanking = oldCard.ranking;
                    updatedCard.ranking = keepRanking;
                }
                await Player.findOneAndUpdate(
                    //update player deck
                    {playerId: userID},
                    {$set: {[`characterDeck.${i}`]: updatedCard}},
                );  
            }
        }
}

//post-condition: adds new fields to player documents
const addNewFieldsToPlayers = async() =>{
    await Player.updateMany(
        {},
        {$set: {"wishRollCount": 0}}
    )
}



module.exports = {
    syncDeck,
    randomAddToDeck,
    resetDailyRollCount,
    addNewFieldsToPlayers,
    resetPityRollCount,
    burnAll,
    getAllPlayerIDs,
    reInitializePoints,
    getID,
    addAll
}