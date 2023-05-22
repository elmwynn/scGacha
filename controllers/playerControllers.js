//these are functions that players specifically use
const Player = require('../models/Player');
const {EmbedBuilder} = require('discord.js');
const giftData = {
    gifts: require('../models/awards.json'),
    setCharacters: function (giftData){
        this.gifts = giftData;
    }
};
const characterData = {
    characters: require('../models/temp.json'),
    setCharacters: function (characterData){
        this.characters = characterData;
    }
};


//** PLAYER CREATION FUNCTIONS *//

//pre-condition: userID available
//post-condition: returns true if player already exists in database
//returns false otherwise
const playerExists = async (userID) => {
    const result = await Player.find({
        //search database for player
        playerId: userID
    })
    if(result.length === 0)
    //create player if they do not exist
        return false;
    return true;
}

//pre-condition: userID obtained
//post-conditoin: creates new player document 
const createPlayer = async (userID, userName) => {
    const newPlayer = await Player.create({
        playerId: userID,
        username: userName
    })
}


//**PLAYER DECK CHANGE AND ROLL INCREMENT FUNCTIONS */

//pre-condition: player exists, card has been obtained
//post-conditions: adds character card to deck
const addToPlayerDeck = async(userID, data) => {
    await Player.findOneAndUpdate(
        {playerId: userID},
        //find player by id
        {$push: {characterDeck: data}}
        //push the card data to their character deck
    );
    let addPoints = 0
    if(data.ranking === '✦')
        addPoints += 1;
    else if(data.ranking === '✦ ✦')
        addPoints += 2;
    else if(data.ranking === '✦ ✦ ✦')  
        addPoints +=5;
    else if(data.ranking === '✦ ✦ ✦ ✦')  
        addPoints += 10;
    else if(rdata.ranking === '✦ ✦ ✦ ✦ ✦')  
            addPoints += 15;
    else
        addPoints+=20;
        await Player.findOneAndUpdate(
            {playerId: userID},
            //find player by id
            {$inc: {points: addPoints}}
            //push the card data to their character deck
        );
}

//pre-condition: player has performed a daily roll
//post-condition: dailyCount of user is incremented by 1
const incrementDailyCount = async(userID) => {
    await Player.findOneAndUpdate(
        {playerId: userID},
        //find player by id
        {$inc:{dailyRollCount: 1}}
        //increment their daily count by 1
    );
}

//pre-condition: player has performed a pity roll
//post-condition: pity count of user is incremented by 1
const incrementPityCount = async(userID) => {
    await Player.findOneAndUpdate(
        {playerId: userID},
        {$inc:{pityRollCount: 1}}
    );
}



// **PLAYER CARD DISPLAY FUNCTIONS ***//

//pre-condition: userID and card number index provided
//post-condition: returns false if index is not valid
//returns true otherwise
const validIndex = async(userID, index) => {
    const result = await Player.find({
        playerId: userID
    })
    if(result[0].characterDeck.length < index || index < 1){
        //if the index is greater than the length of the player deck or if the index is less than 1 
        return false;
    }
    return true;
}

//pre-condition: player has card in deck and requests specific index
//post-condition: embedded of the requested card is returned
const getPlayerCard = async(userID, index) => {
    const result = await Player.find({
        playerId: userID
    });
    const data = result[0].characterDeck[index-1];
    let count;
    if(data.upgradeCount){
        count = data.upgradeCount;
    }
    else{
        count = 'N/A';
    }
    const characterEmbedded = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Card #${index}`)
    .setDescription(`This card belongs to user ${result[0].username}`)
    .setThumbnail('https://sixchanceshome.files.wordpress.com/2021/09/cropped-six-chances-2-1-1.png')
    .addFields(
        { name: 'Name', value: data.name },
        { name: 'Type', value: data.type, inline:true },
        { name: 'Affiliation', value: data.affiliation, inline: true },
        { name: 'Conducting Type', value: data.conductingType},
        { name: 'Ranking', value: data.ranking },
        {name: 'Upgrade Count', value: `${count}` }
    )
    .setImage(data.image);
    return characterEmbedded;
}

//pre-condition: player exists and has cards
//post-condition: returns true if that pageNumber is available
const validCardPage = async(userID, pageNumber) =>{
    if(pageNumber <= 0)
    //if the page number provided is 0 or less
        return false;
    const result = await Player.find({
        playerId: userID
    });
    const numberOfCards = result[0].characterDeck.length;
    //obtain length of deck
    const value = pageNumber*5-5;
    if(value > numberOfCards)
        return false;
    return true;
}

//pre-condition: player exists & has provided a pageNumber
//post-condition: a list of 5 player cards is returned depending on
//the page they chose
const getAllCards = async(userID, pageNumber) => {
    const result = await Player.find({
        playerId: userID
    });
    const length = result[0].characterDeck.length;
    //obtain length of their characterDeck
    if(pageNumber === 1)
    //if they chose page 1
        beginIndex = 0
    else{
        beginIndex = pageNumber*5-5;
    }
    endIndex = beginIndex +5;
    if(endIndex > length){
        //if the addition from the previous line of code is greater than the length
        //that would be invalid, so set the index to the length
        endIndex = length;
    }
    const charactersEmbedded = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Cards of ${result[0].username}, Page ${pageNumber}`)
    for(let i = beginIndex; i < endIndex; i++){
        charactersEmbedded.addFields(
            {name: 'Card #', value: `${i+1}`, inline: true},
            { name: 'Name', value: `${result[0].characterDeck[i].name}`, inline: true },
            { name: 'Ranking', value: `${result[0].characterDeck[i].ranking}`, inline: true },
        )
    }
    return charactersEmbedded;
}

const getGachaStats = async(userID) => {
    const result = await Player.find(
        {playerId: userID}
    )
    const statsArray = [];
    let sixStarCount = 0, fiveStarCount = 0, fourStarCount = 0, threeStarCount = 0, twoStarCount = 0, oneStarCount = 0;
    const points = result[0].points;
    const numberOfGifts = (result[0].gifts).length;
    const username = result[0].username;
    for(let i = 0; i < result[0].characterDeck.length; i++){
        if(result[0].characterDeck[i].ranking === '✦')
            oneStarCount++;
        else if(result[0].characterDeck[i].ranking === '✦ ✦')
            twoStarCount++;
        else if(result[0].characterDeck[i].ranking === '✦ ✦ ✦')  
            threeStarCount++;
        else if(result[0].characterDeck[i].ranking === '✦ ✦ ✦ ✦')  
            fourStarCount++;
        else if(result[0].characterDeck[i].ranking === '✦ ✦ ✦ ✦ ✦')  
            fiveStarCount++;
        else
            sixStarCount++;
    }
    const arrayOfCharacterIDs =[];
    const arrayOfUniqueIDs = []
    for(let i = 0; i < result[0].characterDeck.length; i++)
        arrayOfCharacterIDs.push(result[0].characterDeck[i].id);
    for(let i = 0; i < arrayOfCharacterIDs.length; i++)
        if(!arrayOfUniqueIDs.includes(arrayOfCharacterIDs[i]))
            arrayOfUniqueIDs.push(arrayOfCharacterIDs[i]);
    const uniqueCards = arrayOfUniqueIDs.length;
    statsArray.push(oneStarCount, twoStarCount, threeStarCount, fourStarCount, fiveStarCount, sixStarCount, uniqueCards, points, numberOfGifts, username);
    return statsArray;

}

const displayGachaStats = (array) => {
    const totalCharactersInDatabase = characterData.characters.length;
    console.log(totalCharactersInDatabase);
    const displayStats = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`${array[9]}'s Gacha Stats`)
    .addFields(
        {name: 'CHARACTERS IN DECK', value: ' '},
    )
    .addFields(
        {name: '1-star', value: `${array[0]}`, inline: true},
        {name: '2-star', value: `${array[1]}`, inline:true},
        {name: '3-star', value: `${array[2]}`, inline:true},
        {name: '4-star', value: `${array[3]}`, inline:true},
        {name: '5-star', value: `${array[4]}`, inline:true},
        {name: '6-star', value: `${array[5]}`, inline:true},
        {name: 'COLLECTION: ', value: `${array[6]}/${totalCharactersInDatabase}`},
        {name: 'GIFTS RECEIVED: ', value: `${array[8]}`},
        {name: 'TOTAL POINTS: ', value: `${array[7]}`}
    );
    return displayStats;
}

// **** BURN FUNCTIONS ***** //

//pre-condition: an array of numbers provided by an existing player is provided
//post-condition: returns true if the array of numbers matches card numbers in
//the player deck & if the appropriate cards have been provided
const isValidBurn = async(userID, arrayIndex) => {
    for(let i = 0; i < arrayIndex.length-1; i++){
        //loop through array to ensure that there are no duplicate card#s
        for(let j = i+1; j < arrayIndex.length; j++)
            if(arrayIndex[i] === arrayIndex[j])
                return false;
    }
    const result = await Player.find({
        playerId: userID
    })
    let starCheck = "";
    const listLength = arrayIndex.length;
    if(result[0].characterDeck.length < listLength)
    //the arrayIndex length provided cannot be larger than the player's deck
    //if it is, it's invalid
        return false;
    //obtain the star rating based on length:
    if(listLength === 10){
        //1 star burns
        starCheck = "✦";
    }
    else if(listLength === 8){
        //2 star burns
        starCheck = "✦ ✦";
    }
    else if(arrayIndex.length === 6){
        //3 star burns
        starCheck = "✦ ✦ ✦";
    }
    else if(arrayIndex.length === 4){
        //4 star burns
        starCheck = "✦ ✦ ✦ ✦";
    }
    else if(arrayIndex.length === 2){
        //5 star burns
        starCheck = "✦ ✦ ✦ ✦ ✦"
    }
    else if(arrayIndex.length === 1){
        starCheck = "✦ ✦ ✦ ✦ ✦ ✦"
    }
    else{
        ///if the array length does not match above requirements, 
        //it is an invaid request
        return false;
    }  
    for(let i = 0; i < listLength; i++){
        //loop through the provided card array list and compare the star ratings
        const chosenIndex = arrayIndex[i]-1;
        //obtain the index/card# of card in deck from above
        if(result[0].characterDeck[chosenIndex].ranking !== starCheck){
            return false;
        }
    }
    return true;
}

//pre-condition: burn request is valid
//post-condition: the requested cards are burned and additional rolls
//are added to the player
const burnCards = async(userID, arrayIndex) => {
    const result = await Player.find({
        playerId: userID
    })
    const listLength = arrayIndex.length;
    //obtain length of sacrificed card array
    for(let i = 0; i < listLength; i++){
        //loop through card array
        const cardBurn = result[0].characterDeck[arrayIndex[i]-1];
        //obtain the card to be burned
        const unSet = `characterDeck.${[arrayIndex[i]-1]}`
        //obtain the index/value/format for the card to be removed
        await Player.findOneAndUpdate(
            {playerId: userID},
            {$unset: {[unSet]: cardBurn}},
            //set that card to be burned to null
            {multi:true}
         );
    }
    await Player.findOneAndUpdate(
        {playerId: userID},
        {$pull: {characterDeck: null}}
        //now remove all the nulled/burned cards
    )
    await Player.findOneAndUpdate(
        {playerId: userID},
        {$inc:{dailyRollCount: -3}}
        //decrement the player's roll count by 3
    )
}


// *** PLAYER CARD UPGRADE FUNCTIONS ***//
//currently constructing

const isUpgradable = async(userID, upgradedCard) => {
    const result = await Player.find({
        playerId: userID
    })
    if(result[0].characterDeck.length === 0)
        return false;
    const toUpgrade = result[0].characterDeck[upgradedCard-1];
    if(toUpgrade.upgradeDialogue)
        return true;
    else
        return false;
}

const validUpgrade = async(userID, upgradedCard, burnedCard) =>{
    const result = await Player.find({
        playerId: userID
    })
    const toUpgrade = result[0].characterDeck[upgradedCard-1];
    const toBurn = result[0].characterDeck[burnedCard-1];
    if(toUpgrade.id === toBurn.id /*&& toUpgrade.ranking === toBurn.ranking*/){
        return true;
    }
    else{
        return false;
    }
}

//currently constructing
const upgradeCard  = async(userID, upgradedCard, burnedCard) => {
    const result = await Player.find({
        playerId: userID
    })
    const toUpgrade = result[0].characterDeck[upgradedCard-1];
    if(toUpgrade.ranking ===  "✦ ✦ ✦ ✦ ✦ ✦")
        return;
    const toBurn = result[0].characterDeck[burnedCard-1];

    const toUnset = `characterDeck.${burnedCard-1}`;
    const toUpdate = `characterDeck.${upgradedCard-1}`
    const minusValue = toUpgrade.upgradeCount-1;
    toUpgrade.upgradeCount = minusValue;
    if(minusValue === 12){
        toUpgrade.ranking = "✦ ✦ ✦"
    }
    else if(minusValue === 9){
        toUpgrade.ranking = "✦ ✦ ✦ ✦"
    }
    else if(minusValue === 5){
        toUpgrade.ranking = "✦ ✦ ✦ ✦ ✦"
    }
    else if(minusValue === 0){
        toUpgrade.ranking = "✦ ✦ ✦ ✦ ✦ ✦";
    }
    
    await Player.findOneAndUpdate(
        {playerId: userID},
        {$unset: {[toUnset]: toBurn}}
    )
    await Player.findOneAndUpdate(
        {playerId: userID},
        {$pull: {characterDeck: null}}
    )
    await Player.findOneAndUpdate(
        {playerId: userID},
        {$set: {[toUpdate]: toUpgrade}})
    
}

//currently constructing
const upgradeDialogue = async(userID, upgradedCard) =>{
    const result = await Player.find({
        playerId: userID
    })
    const upgraded = result[0].characterDeck[upgradedCard-1];
    let levelUPDialogue = `${upgraded.name} has evolved to another star level!`;
    console.log(upgraded.name);
    if(upgraded.upgradeCount === 9){
        dialogue = upgraded.upgradeDialogue[3];
    }
    else if(upgraded.upgradeCount === 5){
        dialogue = upgraded.upgradeDialogue[4];
    }
    else if(upgraded.upgradeCount === 0){
        dialogue = upgraded.upgradeDialogue[5];
    }
    else{
        levelUPDialogue=`${upgraded.name} has been leveled up!`;
        dialogue = upgraded.upgradeDialogue[0];
    }
    
    const dialogueEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(levelUPDialogue)
    .addFields(
        {name: 'Current Ranking', value: upgraded.ranking },
        {name: ' ', value: `"${dialogue}"` }
    )
    .setImage(upgraded.image);
    return dialogueEmbed;
}

const isGiftReady =  async(userID, upgradedCard) => {
    const result = await Player.find({
        playerId: userID
    })
    const upgraded = result[0].characterDeck[upgradedCard-1];
    if(upgraded.upgradeCount !== 0)
        return false;
    else 
        return true;
}

const getGift = async (userID, upgradedCard) => {
    const result = await Player.find({
        playerId: userID
    })
    const giftID = result[0].characterDeck[upgradedCard-1].id;
    const allGifts = giftData.gifts;
    for(let i= 0; i < allGifts.length; i++){
        if(allGifts[i].id === giftID)
            return allGifts[i];
    }
}

const showOffGift = async (userID, index) => {
    const result = await Player.find({
        playerId: userID
    })
    return result[0].gifts[index-1];
}

const displayGift = (giftStuff) => {
    const giftEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`A gift from ${giftStuff.from}`)
    .addFields(
        {name: 'Gift', value: giftStuff.name},
        {name: 'Description', value: giftStuff.description }
    )
    .setImage(giftStuff.image);
    return giftEmbed;
}

const validGiftIndex = async(userID, index) => {
    const result = await Player.find({
        playerId: userID
    })
    if(result[0].gifts.length < index || index < 1){
        //if the index is greater than the length of the player deck or if the index is less than 1 
        return false;
    }
    return true;
}


const addGift =  async(userID, data) => {
    await Player.findOneAndUpdate(
        {playerId: userID},
        //find player by id
        {$push: {gifts: data}}
        //push the gift data to their gift deck
    );
    await Player.findOneAndUpdate(
        {playerId: userID},
        //find player by id
        {$inc: {points: 50}}
        //push the gift data to their gift deck
    )
}

//pre-condition: player exists
//post-condition: if player has reached their roll count limit 3
//return false. otherwirse return true
const checkDailyRollCount =  async (userID) => {
    const result = await Player.find({
        playerId: userID
    })
    if(result[0].dailyRollCount  >= 3)
        return false;
    return true;
}

//pre-condition: player exists
//post-condition: if player has reached their pity count limit 1
//return false. otherwirse return true
const checkPityRollCount =  async (userID) => {
    const result = await Player.find({
        playerId: userID
    })
    if(result[0].pityRollCount  >=1)
        return false;
    return true;
}




module.exports = {
    createPlayer,
    playerExists,
    addToPlayerDeck,
    getPlayerCard,
    validIndex,
    checkDailyRollCount,
    isValidBurn,
    burnCards,
    getAllCards,
    validCardPage,
    isUpgradable,
    validUpgrade,
    upgradeDialogue,
    upgradeCard,
    checkPityRollCount,
    incrementDailyCount,
    incrementPityCount,
    isGiftReady,
    getGift,
    displayGift,
    addGift,
    validGiftIndex,
    showOffGift,
    getGachaStats,
    displayGachaStats
}