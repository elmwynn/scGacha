const path = require('path');
const {EmbedBuilder} = require('discord.js')
const characterData = {
    characters: require('../models/characterData.json'),
    setCharacters: function (characterData){
        this.characters = characterData;
    }
};


//pre-condition: player has rolled less than 3x for the day
//post-condition: a random character object is returned
const getCharacter = () => {
    const allCharacters = characterData.characters;
    const randomRank = (Math.floor(Math.random() * 101));
    //obtain a random value between 0-100
    if(randomRank <= 39)
        chosenRank = 0; //1-star ranking characters array
    else if(randomRank <= 64)
        chosenRank = 1; //2-star ranking characters array
    else if(randomRank <=84)
        chosenRank = 2; //3-star ranking character array
    else if(randomRank <= 94)
        chosenRank = 3; //4-star ranking array
    else if(randomRank <= 99)
        chosenRank = 4; //5-star ranking array
    else
        chosenRank = 5; //6-star ranking array
    const randomCard = (Math.floor(Math.random() * allCharacters[chosenRank].length));
    //obtain a random value from 0 to the size of the chosen array
    return allCharacters[chosenRank][randomCard];
}

//pre-condition: pityRollCount < 1
//post-condition: returns a character object with a ranking of 3 to 6 stars
const weekendPityRoll = async() => {
    const allCharacters = characterData.characters;
    const randomRank = (Math.floor(Math.random() * 101));
    if(randomRank <= 75)
        chosenRank = 2;
    else if(randomRank <= 90)
        chosenRank = 3;
    else if(randomRank <= 97)
        chosenRank = 4;
    else{
        chosenRank = 5;

    }
    const randomCard = (Math.floor(Math.random() * allCharacters[chosenRank].length));
    return allCharacters[chosenRank][randomCard];
}

const goldenRoll = async() => {
    const allCharacters = characterData.characters;
    const randomRank = (Math.floor(Math.random() * 101));
    if(randomRank <= 90)
        chosenRank = 4;
    else{
        chosenRank = 5;

    }
    const randomCard = (Math.floor(Math.random() * allCharacters[chosenRank].length));
    return allCharacters[chosenRank][randomCard];
}


//pre-condition: character data is available from the getCharacter function
//post-condition: returns an embedded with values for name, type, affiliation, etc
const getEmbedded = (data) => {
    const characterEmbedded = new EmbedBuilder()
    .setColor(0x0099FF)
	.setTitle('GACHA ROLL!')
	.setDescription('You have rolled....!')
	.setThumbnail('https://sixchanceshome.files.wordpress.com/2021/09/cropped-six-chances-2-1-1.png')
	.addFields(
		{ name: 'Name', value: data.name },
        { name: 'Type', value: data.type, inline:true },
        { name: 'Affiliation', value: data.affiliation, inline: true },
        { name: 'Conducting Type', value: data.conductingType},
        { name: 'Ranking', value: data.ranking }
    )
	.setImage(data.image);
    return characterEmbedded;
}




module.exports = {
    getCharacter,
    getEmbedded,
    weekendPityRoll,
    goldenRoll
}