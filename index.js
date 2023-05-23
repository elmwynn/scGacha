require('dotenv').config();
const {Client, GatewayIntentBits, EmbedBuilder} = require('discord.js');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const characterFunctions = require('./controllers/characterControllers');
const playerFunctions = require('./controllers/playerControllers');
const adminFunctions = require('./controllers/adminControllers');
const achievementFunctions = require('./controllers/achievementsController')

connectDB();
//connect to the mongoDB database

const client = new Client({
     intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

client.on('ready', () => {
    //inform of successful ready connection
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if(message.content.startsWith('/scRoll')){
        const user = message.author.id;
        const name = message.author.username;
        const request = message.content.substring(7);
        const doesExist = await playerFunctions.playerExists(user);
            //determine if user/player already exists in game
        if(!doesExist)
            playerFunctions.createPlayer(user, name);
        if(message.content === '/scRoll'){
            //get userID and username for future functions
            const canRoll = await playerFunctions.checkDailyRollCount(user);
            //check if user has reached the max roll limit for the day
            if(!canRoll){
                message.channel.send("You've reached your daily roll limit!")
            }
            else{
                const test = characterFunctions.getCharacter();
                //obtain character from collection
                const test2 =  characterFunctions.getEmbedded(test);
                //get embedded 
                message.channel.send({embeds: [test2]});
                //send embedded
                await playerFunctions.addToPlayerDeck(user, test);
                //add rolled card to player deck
                await playerFunctions.incrementDailyCount(user);
                //increment daily roll count
            }
        }
        else if(request === 'Pity'){
            const canRoll = await playerFunctions.checkPityRollCount(user);
            //check to see if player can roll
            if(canRoll){
                const pityCard = await characterFunctions.weekendPityRoll();
                //obtain roll
                const displayCard = await characterFunctions.getEmbedded(pityCard);
                //obtain embed of roll
                message.channel.send({embeds: [displayCard]});
                //display roll
                await playerFunctions.addToPlayerDeck(user, pityCard);
                //add to player deck
                await playerFunctions.incrementPityCount(user);
            }
            else{
                message.channel.send("No more pity rolls for you! OWO")
            }
        }
        else if(request === 'Golden'){
            const canRoll = await playerFunctions.checkGoldenRollCount(user);
            //check to see if player can roll
            if(canRoll){
                const goldenCard = await characterFunctions.goldenRoll();
                //obtain roll
                const displayCard = await characterFunctions.getEmbedded(goldenCard);
                //obtain embed of roll
                message.channel.send({embeds: [displayCard]});
                //display roll
                await playerFunctions.addToPlayerDeck(user, goldenCard);
                //add to player deck
                await playerFunctions.incrementGoldenCount(user);
                //increment pity roll count
            }
            else{
                message.channel.send("No more golden rolls for you! OWO")
            }
        }
        const cardIDs = await achievementFunctions.getCharacterIDArray(user);
        const achievementArray = await achievementFunctions.checkAchievement(cardIDs, user);
        if(achievementArray.length !== 0){
            const uniqueAchievemnts = await achievementFunctions.filteredAchievements(user, achievementArray);
            if(uniqueAchievemnts.length !== 0){
                const embeddedAchieve = achievementFunctions.achievementEmbedArray(uniqueAchievemnts)
                for(let i = 0; i < embeddedAchieve.length; i++){
                    message.channel.send({embeds: [embeddedAchieve[i]]})
                }
            await achievementFunctions.addAchievement(user, uniqueAchievemnts);
            }
        }
    }
    else if(message.content.startsWith('/check')){
        const request = message.content.substring(6);
        const user = message.author.id;
        const name = message.author.username;
        const doesExist = await playerFunctions.playerExists(user);
            //check if player exists
        if(!doesExist){
                //create palyer if not
                playerFunctions.createPlayer(user, name);
                console.log('Player Created');
            }
        if(request.search("Card [1-99]") !== -1){
            //get userID and username for future functions
            const indexValue = Number(request.substring(5));
            //obtain requested card number
            const isValid = await playerFunctions.validIndex(user, indexValue);
            //check to see if card is valid
            if(isValid){
                //if card is in the player's deck
                const test3 = await playerFunctions.getPlayerCard(user, indexValue);
                //get embed of card
                message.channel.send({embeds: [test3]});
                //send it
            }
            else{
                message.channel.send("You do not have that card in your deck.")
            }
            
        }
        else if(request.search("AllCards [1-99]") !== -1){
            if(message.author.bot)
                return;
            const number = Number(request.substring(9));
            //obtain card page number
            const validPage = await playerFunctions.validCardPage(user, number);
            //check validitity of request
            if(validPage){
                const embedCards = await playerFunctions.getAllCards(user, number);
                message.channel.send({embeds: [embedCards]});
                //display cards if valid
            }
            else{
                message.channel.send('You do not have any more cards.');
            }
        }
        else if(request.search("Gift [1-99]") !== -1){
            const indexValue = Number(request.substring(5));
            //obtain requested card number
            const isValid = await playerFunctions.validGiftIndex(user, indexValue);
            //check to see if card is valid
            if(isValid){
                //if card is in the player's deck
                const test3 = await playerFunctions.showOffGift(user, indexValue);
                //get embed of card
                const displayG = playerFunctions.displayGift(test3);
                message.channel.send({embeds: [displayG]});
                //send it
            }
            else{
                message.channel.send("You do not have that gift")
            }   
        }
        else if(request === 'GachaStats'){
            const stats = await playerFunctions.getGachaStats(user);
            const displayStat = playerFunctions.displayGachaStats(stats);
            message.channel.send({embeds: [displayStat]});

        }
    }
    
    else if(message.content === '/scGachaRules'){
        const rulesEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('ABOUT SIX CHANCES GACHA ROLL')
        .setDescription('Roll for Six Chances Characters! Try to collect them all!')
        .setThumbnail('https://sixchanceshome.files.wordpress.com/2021/09/cropped-six-chances-2-1-1.png')
        .addFields(
            { name: 'Rolls', value: 'You can roll up to 3 times per day. Rolls are reset daily.' },
            { name: 'Character rarity', value: 'Characters are ranked from 1* to 6* with increasing rarity with increasing star ranking. Almost all major characters are obtainable. The database is updated frequently so you have the opportunity to obtain more characters. Repeat characters are possible.'},
            { name: 'Burning Cards', value: 'If you would like more daily rolls and are willing to sacrifice cards, you can burn your cards to get 3 additional rolls. Must have one of the following requirements: ten 1-star cards, eight 2-star cards, six 3-star cards, four 4-star cards, two 5-star cards, OR one 6-star card.'},
            { name: 'Points', value: 'You can obtain points by rolling for characters, getting achievements, receiving gifts from characters, etc. If you obtain a certai number of points, you may receive a GRAND ROLL for a 5*-6* character.'},
            { name: 'COMMANDS', value: ' '},
            { name: '/scGachaRules', value: 'Get info on how to use the bot.' },
            { name: '/scRoll, /scRollPity, /scRollGolden', value: 'Roll for a character with varying rates. scRoll is a daily roll (3 rolls, 1-star to 6-star). scPityRoll is a daily roll (1 roll, 3-star to 6-star). scGoldenRoll is a special roll (1 roll, 5-star to 6-star)'},
            { name: '/checkCard NUMBER', value: 'Check a specific card (detailed)'},
            { name: '/checkAllCards NUMBER', value: 'Look at multiple cards at once'},
            { name: '/checkGachaStats', value: 'Check your stats!'},
            { name: '/burn CARDNUMBER,CARDNUMBER,CARDNUMBER', value: 'Burn cards for more rolls.'},
            { name: '/upgradee CARDNUMBER CARDNUMBER', value: 'Upgrade a character card.' },
        )
        message.channel.send({embeds: [rulesEmbed]})
    }
    else if(message.content.startsWith('/burn')){
        const user = message.author.id;
        const name = message.author.username;
        //get userID and username for future functions
        const doesExist = await playerFunctions.playerExists(user);
        //check if player exists
        if(!doesExist){
            playerFunctions.createPlayer(user, name);
            console.log('Player Created');
        }
        if(message.author.bot)
        //ensure that bot does not respond to itself 
            return;
        let cardString = message.content.substring(5, message.content.length);
        //obtain card #s to be burned
        cardString = cardString.split(",");
        //covnert to array
        const toNumber = cardString.map(Number);
        //convert strings to numbers
        const numberCard = toNumber.filter(
            (number) => { 
                return !isNaN(number);
                //filter the array so only numbers retained
            }
        )
        let allInDeck = true;
        //assume all those requested burned cards are in the player deck
        for(let i = 0; i < numberCard.length; i++){
            const validArrayIndex = await playerFunctions.validIndex(user, numberCard[i]);
            //check to see if the cards are indeed in player deck
            if(!validArrayIndex){
                //if not, break and set to false
                allInDeck = false;
                break;
            }
        }
        if(numberCard.length === 0){
            //if there was one invalid character given, let user know
            message.channel.send('Uh-oh. Invalid request OWO.')
        }
        else if(allInDeck){
            //if all cards are in deck
            const validBurn = await playerFunctions.isValidBurn(user, numberCard);
            //check to see if the burned cards are valid rankings
            if(validBurn){
                playerFunctions.burnCards(user, numberCard);
                //burn cards and increment daily count
                message.channel.send("You have burned cards and obtained 3 more rolls.")
            }
            else{
                message.channel.send('That was not a valid burn.')
            }
        }
        else{
            message.channel.send('You made an invalid request.');
        }
    }
    else if(message.content.startsWith('/upgrade')){
        //currently constructing:
        
        const user = message.author.id;
        const chosenCards = message.content.substring(9);
        const cardArray = chosenCards.split(" ");
        const numberCardArray = cardArray.map(Number);
        const numberCard = numberCardArray.filter(
            (number) => { 
                return !isNaN(number);
                //filter the array so only numbers retained
            }
        )
        if(numberCard.length === 2 && numberCard[0] !== numberCard[1] && playerFunctions.validIndex(user, numberCard[0]) && playerFunctions.validIndex(user,numberCard[1])){
            const canUpgrade = await playerFunctions.isUpgradable(user, numberCard[0]);
            if(canUpgrade){
                const valid = await playerFunctions.validUpgrade(user, numberCard[0], numberCard[1]);
                if(valid){
                    await playerFunctions.upgradeCard(user, numberCard[0])
                    const embedD = await playerFunctions.upgradeDialogue(user, numberCard[0]);
                    message.channel.send({embeds: [embedD]});
                    if(await playerFunctions.isGiftReady(user, numberCard[0])){
                        const gift = await playerFunctions.getGift(user, numberCard[0]);
                        const giftEmbed = await playerFunctions.displayGift(gift);
                        message.channel.send({embeds: [giftEmbed]});
                        await playerFunctions.addGift(user, gift);
                    }
                    await playerFunctions.burnCardForUpgrade(user, numberCard[1]);
                }
                else{
                    message.channel.send('That was not a valid upgrade.')
                }
            }
            else{
                message.channel.send('That character is not yet upgradable.');
            }
        }
        else{
            message.channel.send('Please list only two different cards for upgrade.')
        }
    }
    else if(message.content.startsWith('/admin') && message.author.id === '182655922043224064'){
        //these are specifically admin functions
        const user = message.author.id;
        const request = message.content.substring(7);
        //obtain the request substring
        console.log(request.startsWith('addToPlayer'));
        if(request === "syncUpdate"){
            const allPlayers = await adminFunctions.getAllPlayerIDs();
            for(let i = 0; i < allPlayers.length; i++){
                await adminFunctions.syncDeck(allPlayers[i]);
            }
            message.channel.send("Character decks have been synced!")
        }
        else if(request.search("pulltest [1-99]") !== -1){
            const cardChosen = Number(request.substring(9));
            await adminFunctions.randomAddToDeck(user, cardChosen);
            message.channel.send('Selected Card has been added.')
           const cardIDs = await achievementFunctions.getCharacterIDArray(user);
            const achievementArray = await achievementFunctions.checkAchievement(cardIDs, user);
            if(achievementArray.length !== 0){
                const uniqueAchievemnts = await achievementFunctions.filteredAchievements(user, achievementArray);
                if(uniqueAchievemnts.length !== 0){
                    const embeddedAchieve = achievementFunctions.achievementEmbedArray(uniqueAchievemnts)
                    for(let i = 0; i < embeddedAchieve.length; i++){
                        message.channel.send({embeds: [embeddedAchieve[i]]})
                    }
                await achievementFunctions.addAchievement(user, uniqueAchievemnts);
                }
            }

        }
         else if(request === "addFields"){
            await adminFunctions.addNewFieldsToPlayers();
            message.channel.send('All player documents updated. Fields added.')
        }
        else if(request=== 'resetCount'){
            await adminFunctions.resetDailyRollCount();
            message.channel.send("Counts have been reset");
        }
        else if(request === 'pityReset'){
            await adminFunctions.resetPityRollCount();
            message.channel.send('Pity Counts have reset!');
        }
        else if(request === 'burnAll'){
            await adminFunctions.burnAll(user);
            message.channel.send('All Cards Removed');
        }
        else if(request.startsWith('addToPlayer')){
            const newReq = request.substring(12);
            const array = newReq.split(" ");
            const idAndCardNum = array.map(Number);
            await adminFunctions.randomAddToDeck(idAndCardNum[0], idAndCardNum[1]);
            message.channel.send(`Card Number ${idAndCardNum[1]} added to ${idAndCardNum[0]} `)
        }
        else if(request === 'resetPoints'){
            const users = await adminFunctions.getAllPlayerIDs();
            for(let i = 0; i < users.length; i++){
                await adminFunctions.reInitializePoints(users[i]);
            }
            message.channel.send('All Points Re-initialized');
        }
        else if(request === 'getID'){
            adminFunctions.getID();
        }
    }
});

client.login(process.env.CLIENT_TOKEN);

mongoose.connection.once('open',() => {
    console.log('Connected to MongoDB');
});