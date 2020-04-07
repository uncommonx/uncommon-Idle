//Game Object - stores all the changing variables
function NewGame() {
    this.seeds = 0;
    this.wheat = 0;
    this.copper = 0;
    this.farmHand = 0;
    this.merchant = 0;
    this.acre = 1;
    this.farmHandPlantingEfficiency = 1;
    this.merchantCapacity = 10;
}

//Create the Game
var Game = new NewGame();

//If a save game exists, load it.
if (window.localStorage['uncommonSave'] != null) {
    window.Game = JSON.parse(window.localStorage['uncommonSave']);
    recalculateEfficiency();
}

//Save the Game
function SaveGame() {
    window.localStorage['uncommonSave'] = JSON.stringify(Game);
}


//Farmhand and Merchant cost
var farmHandCost = 10;
var merchantCost = 100;
var toolCost = 1000000;
var wagonCost = 1000000


//Balance: Seed to Wheat to Copper Ratio
var wheatYield = 2;   //Plant Seed get x Wheat
var wheatPrice = 1;   //Sell Wheat get x Copper
var seedPrice = .5;   //Buy Seed for x Copper each

//Acre and acre efficiency
var acreCost = 1000;
var farmHandsPerAcre = 20;
var merchantsPerAcre = 2
var maxFarmHands = farmHandsPerAcre;  //Starts at base value
var maxMerchants = merchantsPerAcre;  //Starts at base value

//Coin Values (Base 10 or 100? or 1000?)  Multiples coinBase so I can be a bit more dynamic in design
var coinBase = 1000
var silverValue = coinBase;
var goldValue = coinBase * coinBase;
var platinumValue = coinBase * coinBase * coinBase;

//The main game loop for increments.
var timer = 10;
setInterval(loop, 1000);   //1000 = 1 second

//Remove 1 seed, add one wheat and refresh the numbers
function plantSeed(amount) {
    if (Game.seeds >= amount) {
        Game.seeds = Game.seeds - amount;
        Game.wheat = Game.wheat + (amount * wheatYield);
        refreshDisplay();
    }
}

//Remove all the wheat, adding one copper for each wheat and refresh the numbers
function sellWheat(amount) {
    if (Game.wheat >= amount) {
        Game.copper = Game.copper + (amount * wheatPrice);
        Game.wheat = Game.wheat - amount;
        refreshDisplay();
    }
}

//Remove 5 copper, add 10 seeds and refresh the numbers
function buySeeds(amount) {
    if (Game.copper >= amount * seedPrice) {
        Game.seeds = Game.seeds + amount;
        Game.copper = Game.copper - (amount * seedPrice);
        refreshDisplay();
    }
}

//Add one Farm Hand, remove 10 copper, refresh the numbers
function hireFarmHand(amount) {
    if ((Game.copper >= amount * farmHandCost) && (Game.farmHand + amount <= maxFarmHands)) {
        Game.farmHand = Game.farmHand + amount;
        Game.copper = Game.copper - amount * farmHandCost;
        refreshDisplay();
    }
}

//Add one merchant, subtract 100 copper, refresh the numbers
function hireMerchant(amount) {
    if ((Game.copper >= amount * merchantCost) && (Game.merchant + amount <= maxMerchants)) {
        Game.merchant = Game.merchant + amount;
        Game.copper = Game.copper - amount * merchantCost;
        refreshDisplay();
    }
}

//Add Acres, increase maximum values of merchants and farmhands and refresh numbers
function buyAcre(amount) {
    if (Game.copper >= acreCost * amount) {
        Game.copper = Game.copper - (acreCost * amount);
        Game.acre = Game.acre + amount;
        refreshDisplay();
    }
}

//Adjust Max Farmhands and Merchants and refresh numbers
function recalculateEfficiency() {
    maxFarmHands = Game.acre * farmHandsPerAcre;
    maxMerchants = Game.acre * merchantsPerAcre;
}

//Buy Tools to help Farm Hands work more efficiently
function buyTools() {
    if (Game.copper >= toolCost) {
        Game.farmHandPlantingEfficiency++;
        Game.copper = Game.copper - toolCost;
        refreshDisplay();
    }
}

//Buy a Wagon so the Merchant can carry more
function buyWagon() {
    if (Game.copper >= wagonCost) {
        Game.merchantCapacity = Game.merchantCapacity + 10;
        Game.copper = Game.copper - wagonCost;
        refreshDisplay();
    }
}

//Runs every 1 second due to setInterval function at the top.  Plants 1 seed for every farmhand and refreshes the numbers.  
//Save every 10 seconds.
function loop() {
    Game.seeds++;
    plantSeed(Game.farmHandPlantingEfficiency * Game.farmHand);
    sellWheat(Game.merchantCapacity * Game.merchant);
    buySeeds(Game.merchantCapacity * Game.merchant);
    timer--;
    if (timer == -1) {
        SaveGame();
        timer = 10;
    }
    refreshDisplay();
}

//This function takes in copper and returns a string for the currency format.  Takes into account the base coin system
function formatCopper(amount) {
    var p = Math.floor(amount / platinumValue);
    var g = Math.floor((amount - (p * platinumValue)) / goldValue);
    var s = Math.floor((amount - (p * platinumValue) - (g * goldValue)) / silverValue);
    var c = Math.floor(amount - (p * platinumValue) - (g * goldValue) - (s * silverValue));

    //Conditional statement that prevents zeros from being formatted
    if (p > 0) {
        var coinPurse = AddSeparators(p) + "pp " + g + "gp " + s + "sp " + c + "cp ";
    } else if (g > 0) {
        var coinPurse = g + "gp " + s + "sp " + c + "cp ";
    } else if (s > 0) {
        var coinPurse = s + "sp " + c + "cp ";
    } else {
        var coinPurse = c + "cp ";
    }
    return coinPurse;
}



//Function used to refresh all the numbers based on the variable changes
function refreshDisplay() {
    recalculateEfficiency();
    document.getElementById("seedCountDisplay").innerHTML =
        "You have " + AddSeparators(Game.seeds) + " seeds";
    document.getElementById("wheatCountDisplay").innerHTML =
        "You have " + AddSeparators(Game.wheat) + " wheat";
    document.getElementById("copperCountDisplay").innerHTML =
        "You have " + formatCopper(Game.copper);
    document.getElementById("farmHandCountDisplay").innerHTML =
        "You have " + AddSeparators(Game.farmHand) + " out of " + AddSeparators(maxFarmHands) + " available farm hands";
    document.getElementById("merchantCountDisplay").innerHTML =
        "You have contracted " + AddSeparators(Game.merchant) + " out of " + AddSeparators(maxMerchants) + " available merchants";
    document.getElementById("acreCountDisplay").innerHTML =
        "You have " + AddSeparators(Game.acre) + " acre of Farm Land";
    document.getElementById("toolCount").innerHTML =
        "You have " + AddSeparators(Game.farmHandPlantingEfficiency - 1) + " tools";
    document.getElementById("wagonCount").innerHTML =
        "You have " + AddSeparators((Game.merchantCapacity - 10) / 10) + " wagons";
    document.getElementById("saveTimer").innerHTML =
        "Autosaving in " + timer + " seconds...";
}



function AddSeparators(input) { //Add separators to large numbers, returns a string
    var Before = String(input); //Turn the input into a string
    var SplitBefore = Before.split("."); //Split the input by "." to get the decimal
    var After = ""; //Reset the result
    var LastThree = ""; //Reset the last 3 characters

    while (SplitBefore[0].length > 0) { //While the left half of the number is still there
        LastThree = SplitBefore[0].slice(-3); //Take the last 3
        SplitBefore[0] = SplitBefore[0].slice(0, -3); //Remove the last 3
        if (After.length == 0) { After = LastThree; } else { After = LastThree + "," + After; } //Append the last 3
    }

    return After; //Return the number as a string
}