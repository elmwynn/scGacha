const path = require('path');
const Player = require('../models/Player');
const {EmbedBuilder, ApplicationRoleConnectionMetadataType} = require('discord.js');
const { all } = require('axios');
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
//these functions either require a UserID or an array of Charater Ids to be provided

//pre-condition: receives an array of character IDs from player
const synchronizationAchievement = (synchroArray) =>{
    if(synchroArray.includes(1) && synchroArray.includes(2) && synchroArray.includes(3) &&synchroArray.includes(4) && synchroArray.includes(5) && synchroArray.includes(6))
        achievementObtained = allAchievements[0];
    else    
        achievementObtained = -1;
    
    return achievementObtained;
}

//pre-condition: receives an array of character IDs from player
const lucky7Achievement = (lucky7Array) =>{
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

//pre-condition: recieves an array of characterIDs from player deck
const preciousAchiev = (characterArray) => {
    if(characterArray.includes(45) && characterArray.includes(46) && characterArray.includes(9) && characterArray.includes(117) & characterArray.includes(118))
        return allAchievements[4];
    return -1;

}

const forGloryAchiev = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const allCharacters = characterData.characters;
    let capricornCount = [];
    let playerCount = [];
    for(let i = 0; i < allCharacters.length; i++){
        if(allCharacters[i].affiliation === 'Capricornian Army')
            capricornCount.push(allCharacters[i].id);
    }
    for(let i = 0; i < result[0].characterDeck.length; i++){
        const id = result[0].characterDeck[i].id;
        const affiliation = result[0].characterDeck[i].affiliation;
        if(!playerCount.includes(id) && affiliation === 'Capricornian Army')
            playerCount.push(result[0].characterDeck[i].id);
    }
    if(capricornCount.length === playerCount.length)
        return allAchievements[5];
    return -1;

}

const pulseAchieve = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const allCharacters = characterData.characters;
    let trueConductorCount = [];
    let playerCount = [];
    for(let i = 0; i < allCharacters.length; i++){
        if(allCharacters[i].type === 'True Conductor')
            trueConductorCount.push(allCharacters[i].id);
    }
    for(let i = 0; i < result[0].characterDeck.length; i++){
        const id = result[0].characterDeck[i].id;
        const type = result[0].characterDeck[i].type;
        if(!playerCount.includes(id) && type === 'True Conductor')
            playerCount.push(result[0].characterDeck[i].id);
    }
    if(trueConductorCount.length === playerCount.length)
        return allAchievements[6];
    return -1;

}

const reversusOratioAchieve = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const allCharacters = characterData.characters;
    let elpisLeadCount = [];
    let playerCount = [];
    for(let i = 0; i < allCharacters.length; i++){
        if(allCharacters[i].type === 'ELPIS Leader')
            elpisLeadCount.push(allCharacters[i].id);
    }
    for(let i = 0; i < result[0].characterDeck.length; i++){
        const id = result[0].characterDeck[i].id;
        const type = result[0].characterDeck[i].type;
        if(!playerCount.includes(id) && type === 'ELPIS Leader')
            playerCount.push(result[0].characterDeck[i].id);
    }
    if(elpisLeadCount.length === playerCount.length)
        return allAchievements[7];
    return -1;
}

const wernDivision = (characterIDArray) => {
    if(characterIDArray.includes(3) && characterIDArray.includes(10) && characterIDArray.includes(22) && characterIDArray.includes(23) & characterIDArray.includes(24) & characterIDArray.includes(27) & characterIDArray.includes(26) & characterIDArray.includes(25) & characterIDArray.includes(119) & characterIDArray.includes(120))
        return allAchievements[8];
    return -1;
}

const thoseInPower = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const allCharacters = characterData.characters;
    let politicalLeaderCount = [];
    let playerCount = [];
    for(let i = 0; i < allCharacters.length; i++){
        if(allCharacters[i].type === 'Political Leader')
        politicalLeaderCount.push(allCharacters[i].id);
    }
    for(let i = 0; i < result[0].characterDeck.length; i++){
        const id = result[0].characterDeck[i].id;
        const type = result[0].characterDeck[i].type;
        if(!playerCount.includes(id) && type === 'Political Leader')
            playerCount.push(result[0].characterDeck[i].id);
    }
    if(politicalLeaderCount.length === playerCount.length)
        return allAchievements[9];
    return -1;
}

const cantHelpButGo = (characterIDArray) => {
    if(characterIDArray.includes(100) && characterIDArray.includes(99) && characterIDArray.includes(101))
        return allAchievements[10];
    return -1;
}

const playPretend = (characterIDArray) => {
    if(characterIDArray.includes(50) && characterIDArray.includes(80) && characterIDArray.includes(16) && characterIDArray.includes(77))
        return allAchievements[11];
    return -1;
}


const gloriaGrail = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const allCharacters = characterData.characters;
    let gloriaGrailCount = [];
    let playerCount = [];
    for(let i = 0; i < allCharacters.length; i++){
        if(allCharacters[i].affiliation === 'Gloria\'s Grail')
            gloriaGrailCount.push(allCharacters[i].id);
    }
    for(let i = 0; i < result[0].characterDeck.length; i++){
        const id = result[0].characterDeck[i].id;
        const affiliation = result[0].characterDeck[i].affiliation;
        if(!playerCount.includes(id) && affiliation ===  'Gloria\'s Grail')
            playerCount.push(result[0].characterDeck[i].id);
    }
    if(gloriaGrailCount.length === playerCount.length)
        return allAchievements[12];
    return -1;
}

const starsAndSky = (characterIDArray) => {
    if(characterIDArray.includes(36) && characterIDArray.includes(4) && characterIDArray.includes(41) && characterIDArray.includes(12) && characterIDArray.includes(35) && characterIDArray.includes(58) && characterIDArray.includes(127))
        return allAchievements[13];
return -1;
}

const innerCircle = (characterIDArray) => {
    if(characterIDArray.includes(15) && characterIDArray.includes(16) && characterIDArray.includes(50) && characterIDArray.includes(53) && characterIDArray.includes(6) && characterIDArray.includes(17)  && characterIDArray.includes(14) && characterIDArray.includes(18) && characterIDArray.includes(124) && characterIDArray.includes(91))
        return allAchievements[14];
return -1;
}

const remnants = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const allCharacters = characterData.characters;
    let remnantCount = [];
    let playerCount = [];
    for(let i = 0; i < allCharacters.length; i++){
        if(allCharacters[i].type === 'Remnant')
            remnantCount.push(allCharacters[i].id);
    }
    for(let i = 0; i < result[0].characterDeck.length; i++){
        const id = result[0].characterDeck[i].id;
        const type = result[0].characterDeck[i].type;
        if(!playerCount.includes(id) && type ===  'Remnant')
            playerCount.push(result[0].characterDeck[i].id);
    }
    if(remnantCount.length === playerCount.length)
        return allAchievements[15];
    return -1;
}

const gentleNurturing = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    for(let i = 0; i < result[0].characterDeck.length; i++){
        if(result[0].characterDeck[i].ranking){
            if(result[0].characterDeck[i].ranking === '✦ ✦ ✦ ✦ ✦ ✦' && result[0].characterDeck[i].upgradeCount === 0)
                return allAchievements[16];
        }
    }
    return -1;
}

const beClouds = (characterIDArray) => {
    if(characterIDArray.includes(8) && characterIDArray.includes(37) && characterIDArray.includes(36)){
        return allAchievements[17]
    };
    return -1;
}


const headPeace = (characterIDArray) => {
    if(characterIDArray.includes(96) && characterIDArray.includes(98) && characterIDArray.includes(94) && characterIDArray.includes(93) && characterIDArray.includes(92) && characterIDArray.includes(91) && characterIDArray.includes(90) && characterIDArray.includes(15) && characterIDArray.includes(52) && characterIDArray.includes(95) && characterIDArray.includes(97)&& characterIDArray.includes(35) && characterIDArray.includes(94) && characterIDArray.includes(143)){
        return allAchievements[18]
    };
    return -1;
}

const converge = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const arrayOfIds = [];
    for(let i = 0; i < result[0].characterDeck.length; i++){
        if(result[0].characterDeck[i].id === 1 && result[0].characterDeck[i].upgradeCount === 0){
            arrayOfIds.push(result[0].characterDeck[i].id);
        }
        else if(result[0].characterDeck[i].id === 2 && result[0].characterDeck[i].upgradeCount === 0){
            arrayOfIds.push(result[0].characterDeck[i].id);
        }
        else if(result[0].characterDeck[i].id === 3 && result[0].characterDeck[i].upgradeCount === 0){
            arrayOfIds.push(result[0].characterDeck[i].id);
        }
        else if(result[0].characterDeck[i].id === 4 && result[0].characterDeck[i].upgradeCount === 0){
            arrayOfIds.push(result[0].characterDeck[i].id);
        }
        else if(result[0].characterDeck[i].id === 5 && result[0].characterDeck[i].ranking === "✦ ✦ ✦ ✦ ✦ ✦"){
            arrayOfIds.push(result[0].characterDeck[i].id);
        }
        else if(result[0].characterDeck[i].id == 6 && result[0].characterDeck[i].upgradeCount === 0){
            arrayOfIds.push(result[0].characterDeck[i].id);
        }
    }
    if(arrayOfIds.includes(1) && arrayOfIds.includes(2) && arrayOfIds.includes(3) && arrayOfIds.includes(4) && arrayOfIds.includes(5) && arrayOfIds.includes(6))
        return allAchievements[19];
    return -1;
}

const politicalBond = (characterIDArray) => {
    if(characterIDArray.includes(104) && characterIDArray.includes(105) && characterIDArray.includes(38) && characterIDArray.includes(41) && characterIDArray.includes(92)){
        return allAchievements[20]
    };
    return -1;
}

const fromAshes = async (userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const allCharacters = characterData.characters;
    let royalCount = [];
    let playerCount = [];
    for(let i = 0; i < allCharacters.length; i++){
        if(allCharacters[i].affiliation === 'Ariesian Royalty')
            royalCount.push(allCharacters[i].id);
    }
    for(let i = 0; i < result[0].characterDeck.length; i++){
        const id = result[0].characterDeck[i].id;
        const affiliation = result[0].characterDeck[i].affiliation;
        if(!playerCount.includes(id) && affiliation ===  'Ariesian Royalty')
            playerCount.push(result[0].characterDeck[i].id);
        if(!playerCount.includes(id) && id === 81 )
            playerCount.push(result[0].characterDeck[i].id);
            if(!playerCount.includes(id) && id === 149)
            playerCount.push(result[0].characterDeck[i].id);
    }
    if(royalCount.length + 2 === playerCount.length)
        return allAchievements[21];
    return -1;
}

const animals = (characterIDArray) => {
    if(characterIDArray.includes(169) && characterIDArray.includes(171) && characterIDArray.includes(172) && characterIDArray.includes(173)){
        return allAchievements[23]
    };
    return -1;
}

//** MAIN ACHIEVEMENT FUNCTIONS */

//pre-condition: userID and an array of character IDs is provided
//post-condition: returns an array of achievements based on whether or not the player has met each of the requirements
const checkAchievement = async(array, userID) => {
    const obtainedAchievements = [];
    if(synchronizationAchievement(array) !== -1)
        obtainedAchievements.push(synchronizationAchievement(array));
    if(lucky7Achievement(array) !== -1)
        obtainedAchievements.push(lucky7Achievement(array));
    if(await twinCitiesAchiev(userID) !== -1)
        obtainedAchievements.push(await twinCitiesAchiev(userID));
    if(await endlessCyclesAchieve(userID) !== -1)
        obtainedAchievements.push(await endlessCyclesAchieve(userID));
    if(preciousAchiev(array) !== -1)
        obtainedAchievements.push(preciousAchiev(array));
    if(await forGloryAchiev(userID) !== -1)
        obtainedAchievements.push(await forGloryAchiev(userID));
    if(await pulseAchieve(userID) !== -1)
        obtainedAchievements.push(await pulseAchieve(userID));
    if(await reversusOratioAchieve(userID) !== -1)
        obtainedAchievements.push(await reversusOratioAchieve(userID));
    if(wernDivision(array) !== -1)
        obtainedAchievements.push(wernDivision(array));
    if(await thoseInPower(userID) !== -1)
        obtainedAchievements.push(await thoseInPower(userID));
    if(cantHelpButGo(array) !== -1)
        obtainedAchievements.push(cantHelpButGo(array));
    if(playPretend(array) !== -1)
        obtainedAchievements.push(playPretend(array));
    if(await gloriaGrail(userID) !== -1)
        obtainedAchievements.push(await gloriaGrail(userID));
    if(starsAndSky(array) !== -1)
        obtainedAchievements.push(starsAndSky(array));
    if(innerCircle(array) !== -1)
        obtainedAchievements.push(innerCircle(array));
    if(await remnants(userID)!== -1)
        obtainedAchievements.push(await remnants(userID));
    if(await gentleNurturing(userID) !== -1)
        obtainedAchievements.push(await gentleNurturing(userID));
    if(beClouds(array) !== -1)
        obtainedAchievements.push(beClouds(array));
    if(headPeace(array) !== -1)
        obtainedAchievements.push(headPeace(array));
    if(await converge(userID) !== -1)
        obtainedAchievements.push(await converge(userID));
    if(politicalBond(array) !== -1)
        obtainedAchievements.push(politicalBond(array));
    if(await fromAshes(userID) !== -1)
        obtainedAchievements.push(await fromAshes(userID));
    if(animals(array) !== -1)
        obtainedAchievements.push(animals(array));
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

//pree-condition: receives an array of achievement ids and player id
//post-condition: returns an array containing the acheivement ids that hte player does not yet have
const filteredAchievements = async(userID, array) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const alreadyAchieved = result[0].achievements;
    //obtain achievements player already has
    const obtainedAchieved = array.filter(
        //filter through the array of achievements the user has gained with the roll
        achievement  => !alreadyAchieved.some(alreadyAchieved => alreadyAchieved.id === achievement.id)
        //return an array with only achievements not matching those the player already has
    )
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