const path = require('path');
const Player = require('../models/Player');
const {EmbedBuilder} = require('discord.js');
const achievementData = {
    achievements: require('../models/achievements.json'),
    setCharacters: function (achievementData){
        this.achievements = achievementData;
    }
};

const allAchievements = achievementData.achievements;

const characterData = {
    characters: require('../models/temp.json'),
    setCharacters: function (characterData){
        this.characters = characterData;
    }
};

const getCharacterIDArray = async(userID)=>{
    const result = await Player.find(
        {playerId: userID}
    )
    const idArray = [];
    for(let i = 0; i < result[0].characterDeck.length; i++)
        idArray.push(result[0].characterDeck[i].id);
    return idArray;
}


//** HELPER FUNCTIONS */
//pre-condition: receives an array of character IDs from player
const synchronizationAchievement = async(synchroArray) =>{
    if(synchroArray.includes(1) && synchroArray.includes(2) && synchroArray.includes(3) &&synchroArray.includes(4) && synchroArray.includes(5) && synchroArray.includes(6))
        achievementObtained = allAchievements[0];
    else    
        achievementObtained = -1;
    
    return achievementObtained;
}

//pre-condition: receives an array of character IDs from player
const lucky7Achievement = async(lucky7Array) =>{
    if(lucky7Array.includes(1) && lucky7Array.includes(2) && lucky7Array.includes(3) && lucky7Array.includes(4) && lucky7Array.includes(5) && lucky7Array.includes(6) && lucky7Array.includes(7))
        achievementObtained = allAchievements[1];
    else    
        achievementObtained = -1;
    return achievementObtained;
}

//pre-condition: receives an array of character IDs from player
const twinCitiesAchiev = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const allCharacters = characterData.characters;
    let citiesCount = [];
    let playerCount = [];
    for(let i = 0; i < allCharacters.length; i++){
        if(allCharacters[i].affiliation === 'Twin Cities Underground')
            citiesCount.push(allCharacters[i].id)
    }
    for(let i = 0; i < result[0].characterDeck.length; i++){
        const id = result[0].characterDeck[i].id;
        const affiliation = result[0].characterDeck[i].affiliation;
        if(!playerCount.includes(id) && affiliation === 'Twin Cities Underground')
            playerCount.push(result[0].characterDeck[i].id);
    }
    if(citiesCount.length === playerCount.length)
        return allAchievements[2];
    return -1
}

//pre-condition: receives an array of character IDs from player
const endlessCyclesAchieve = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const allCharacters = characterData.characters;
    let saintCount = [];
    let playerCount = [];
    for(let i = 0; i < allCharacters.length; i++){
        if(allCharacters[i].type === 'Saint Candidate')
            saintCount.push(allCharacters[i].id);
    }
    for(let i = 0; i < result[0].characterDeck.length; i++){
        const id = result[0].characterDeck[i].id;
        const type = result[0].characterDeck[i].type;
        if(!playerCount.includes(id) && type === 'Saint Candidate')
            playerCount.push(result[0].characterDeck[i].id);
    }
    if(saintCount.length === playerCount.length)
        return allAchievements[3];
    return -1;
}



//** MAIN ACHIEVEMENT FUNCTIONS */

const checkAchievement = async(array, userID) => {
    const obtainedAchievements = [];
    if(await synchronizationAchievement(array) !== -1)
        obtainedAchievements.push(await synchronizationAchievement(userID));
     
    if(await lucky7Achievement(array) !== -1)
        obtainedAchievements.push(await lucky7Achievement(array));
     
    if(await twinCitiesAchiev(userID) !== -1)
        obtainedAchievements.push(await twinCitiesAchiev(userID));
     
    if(await endlessCyclesAchieve(userID) !== -1)
        obtainedAchievements.push(await endlessCyclesAchieve(userID));
    
    return obtainedAchievements;
}

//pre-condition: receives array from filteredAchievements;
const addAchievement = async(userID, array) => {
    let obtainedAchieve = array;
    const achievements = achievementData.achievements;
    for(let i = 0; i < obtainedAchieve.length; i++){
        for(let k= 0; k < achievements.length; k++)
            if(obtainedAchieve[i].id === achievements[k].id){
                await Player.findOneAndUpdate(
                    {playerId: userID},
                    {$push: {achievements: achievements[k]}}
                )
                await Player.findOneAndUpdate(
                    {playerId: userID},
                    {$inc: {points: achievements[k].points}}
                )
            }
    }
}

const filteredAchievements = async(userID, array) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const alreadyAchieved = result[0].achievements;
    const obtainedAchieved = array;
    if(alreadyAchieved.length !== 0){
    for(let i = 0; i < array.length; i++)
        for(let k = 0; k < alreadyAchieved.length; k++){
           if(array[i].id === alreadyAchieved[k].id)
                obtainedAchieved.splice(i,1);
            if(obtainedAchieved.length === 0)
                break;
        }
    }
    return obtainedAchieved;
}



const achievementEmbedArray = (array) => {
    const embedArray = [];
    for(let i = 0; i < array.length; i++){
        const achieveEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Achievement Achieved!')
        .addFields(
            {name: 'Achievement:', value: `${array[i].achievement}`},
            {name: 'Description:', value: `${array[i].description}`},
            {name: 'Points:', value: `${array[i].points}`}
        );
        embedArray.push(achieveEmbed);
    }
    return embedArray;
}

module.exports = {
    synchronizationAchievement,
    lucky7Achievement,
    twinCitiesAchiev,
    endlessCyclesAchieve,
    checkAchievement,
    addAchievement,
    achievementEmbedArray,
    getCharacterIDArray,
    filteredAchievements
}