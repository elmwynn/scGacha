require('dotenv').config();
const {Client, GatewayIntentBits, EmbedBuilder} = require('discord.js');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const characterFunctions = require('./controllers/characterControllers');
const playerFunctions = require('./controllers/playerControllers');
const adminFunctions = require('./controllers/adminControllers');

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
    if(message.content === '/scRoll'){
        const user = message.author.id;
        const name = message.author.username;
        //get userID and username for future functions
        const doesExist = await playerFunctions.playerExists(user);
        //determine if user/player already exists in game
        if(doesExist)
            console.log(`Player ${user} has rolled`);
            //if it does, make note of it and continue
        else{
            //otherwise createa new player document
            playerFunctions.createPlayer(user, name);
            console.log('Player Created');
        }
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
    else if(message.content === '/scPityRoll'){
        const user = message.author.id;
        const name = message.author.username;
        //get userID and username for future functions
        const doesExist = await playerFunctions.playerExists(user);
        //check to see if player exists
        if(!doesExist){
            //create player if htey don't
            playerFunctions.createPlayer(user, name);
            console.log('Player Created');
        }
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
            //increment pity roll count
        }
        else{
            message.channel.send("No more pity rolls for you! OWO")
        }
    }
    else if(message.content.search("/checkCard [1-99]") !== -1){
        const user = message.author.id;
        const name = message.author.username;
        //get userID and username for future functions
        const doesExist = await playerFunctions.playerExists(user);
        //check if player exists
        if(!doesExist){
            //create palyer if not
            playerFunctions.createPlayer(user, name);
            console.log('Player Created');
        }
        const indexValue = Number(message.content.substring(10));
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
            { name: 'COMMANDS', value: ' '},
            { name: '/scGachaRules', value: 'Get info on how to use the bot.' },
            { name: '/scRoll', value: 'Roll for a character'},
            { name: '/scPityRoll', value: 'Pity roll for a 3-star to 6-star character. Resets whenever pity strikes.'},
            { name: '/checkCard NUMBER', value: 'Check a specific card (detailed)'},
            { name: '/checkAllCards NUMBER', value: 'Look at multiple cards at once'},
            { name: '/burn CARDNUMBER,CARDNUMBER,CARDNUMBER', value: 'Burn cards for more rolls.'}
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
    else if(message.content.search("/checkAllCards [1-99]") !== -1){
        const user = message.author.id;
        const name = message.author.username;
        //get userID and username for future functions
        const doesExist = await playerFunctions.playerExists(user);
        //check to see if user exists
        if(!doesExist){
            playerFunctions.createPlayer(user, name);
            console.log('Player Created');
        }
        if(message.author.bot)
            return;
        const number = Number(message.content.substring(15));
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
    else if(message.content.startsWith('/upgrade')){
        //currently constructing:
        if( message.author.id === '182655922043224064'){
        const user = message.author.id;
        const chosenCards = message.content.substring(9);
        const cardArray = chosenCards.split(" ");
        const numberCardArray = cardArray.map(Number);
        const valid = await playerFunctions.validUpgrade(user, numberCardArray[0], numberCardArray[1]);
       if(valid){
        console.log('passes');
            await playerFunctions.upgradeCard(user, numberCardArray[0], numberCardArray[1]);
            console.log('passes here');
            const embedD = await playerFunctions.upgradeDialogue(user, numberCardArray[0]);
            message.channel.send({embeds: [embedD]});
       }
       else{
        console.log('not valid');
       }}
       else{
        message.channel.send('OWO. That function is still in beta mode!')
       }
    }
    else if(message.content.startsWith('/admin') && message.author.id === '182655922043224064'){
        //these are specifically admin functions
        const request = message.content.substring(7);
        //obtain the request substring
        if(request === "syncUpdate"){
            const user = message.author.id;
            await adminFunctions.syncDeck(user);
            message.channel.send("Character decks have been synced!")
        }
        else if(request === "pulltest"){
            const user = message.author.id;
            await adminFunctions.randomAddToDeck(user);
            message.channel.send('Selected Card has been added.')
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
    }
});

client.login(process.env.CLIENT_TOKEN);

mongoose.connection.once('open',() => {
    console.log('Connected to MongoDB');
});