const Player = require('../models/Player');
const pointShopData = {
    pointsShop: require('../models/pointShop.json'),
    setCharacters: function (pointShopData){
        this.pointsShop = pointShopData;
    }
};
const {EmbedBuilder} = require('discord.js');

const displayShop = () => {
    const shopInfo = pointShopData.pointsShop;
    const shopDetails = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Gacha Point Shop')
    .setDescription('Welcome to the Gacha Point Shop where you can exchange points you\'ve earned for all sorts of items! New items will come and old items will come from time to time! To purchase an item, say "/purchase itemNumber"!')
    .addFields(
        {name: `1. ${shopInfo[0].item}\t•\t${shopInfo[0].cost} points`, value: `*${shopInfo[0].description}*`},
        {name: `2. ${shopInfo[1].item}\t•\t${shopInfo[1].cost} points`, value: `*${shopInfo[1].description}*`},
        {name: `3. ${shopInfo[2].item}\t•\t${shopInfo[2].cost} points`, value: `*${shopInfo[2].description}*`},
        {name: `4. ${shopInfo[3].item}\t•\t${shopInfo[3].cost} points`, value: `*${shopInfo[3].description}*`},
    );
    return shopDetails;
}

const validShopRequest = (itemNumber) => {
    const shopInfo = pointShopData.pointsShop;
    if(itemNumber > shopInfo.length || itemNumber < 1 ||isNaN(itemNumber))
        return false;
    return true;

}

const getShopItem = (itemNumber) => {
    const shopInfo = pointShopData.pointsShop;
    return shopInfo[itemNumber-1];
}

const enoughPoints = async(userID, itemNumber) => {
    const result = await Player.find(
        {playerId: userID}
    )
    if(itemNumber.cost > result[0].points)
        return false;
    return true;

}

const transactShop = async(userID, item) => {
    await Player.findOneAndUpdate(
        {playerId: userID},
        {$inc: {points: -item.cost}}
    );
}

const getItem = async(userID, item) => {
    await Player.findOneAndUpdate(
        {playerId: userID},
        {$inc: {[`${item.tag}`]: -item.amount}}
    )
}

module.exports = {
    validShopRequest,
    displayShop,
    getShopItem,
    enoughPoints,
    transactShop,
    getItem
}