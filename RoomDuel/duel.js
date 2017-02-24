var itemTypes = ["Negate", "Heal", "Absorb"];
var itemLevels = ["Minor", "Major", "Max"];
var itemCategories = ["Consumable"];
var NUM_OF_ITEM_TYPES = 3;
var NUM_OF_ITEM_LEVELS = 3;
var NUM_OF_ITEM_CATEGORIES = 1;

function MagicItem(type, level, category) {
    this.type = type;
    this.level = level;
    this.category = category;
}

function Wizard(type, hp, pocket) {
    this.type = type;
    this.hp = hp;
    this.pocket = pocket;
    this.selectedItem = null;
    
    var updateSession = function() {
        if (this.type === "Player")
            sessionStorage.setItem("player", JSON.stringify(this));
        else if (this.type === "Opponent")
            sessionStorage.setItem("opponent", JSON.stringify(this));
    };

    this.setHp = function(hp) {
        this.hp = hp;
        updateSession.call(this);
    };
    
    this.pickUpItem = function() {
        this.pocket.push(new MagicItem(Math.floor(NUM_OF_ITEM_TYPES*Math.random()), Math.floor(NUM_OF_ITEM_LEVELS*Math.random()),
                                       Math.floor(NUM_OF_ITEM_CATEGORIES*Math.random())));
        updateSession.call(this);
    };
    
    this.emptyPocket = function() {
        while (this.pocket.length > 0)
            this.pocket.pop();
        updateSession.call(this);
    };
    
    this.reset = function() {
        this.hp = 20;
        this.emptyPocket();
        updateSession.call(this);
    };

    this.attack = function(wizard) {
        var damage = Math.floor(6*Math.random()) + 1;
        if (this.type === "Player")
        {
            document.getElementById("o_status_info").textContent += "Player attacks with fireball! ";
            document.getElementById("o_status_info").textContent += "Player tries to afflict " + damage + " HP of damage! ";
            damage = Math.ceil(wizard.useItem(damage));
            if (damage > 0)
                document.getElementById("o_status_info").textContent += "Opponent loses " + damage + " HP! ";
            else if (damage == 0)
                document.getElementById("o_status_info").textContent += "Opponent takes no damage! ";
            else
                document.getElementById("o_status_info").textContent += "Opponent gains " + -damage + " HP! ";
        }
        else if (this.type === "Opponent")
        {
            document.getElementById("p_status_info").textContent += "Lightning attack! ";
            document.getElementById("p_status_info").textContent += "Opponent tries to afflict " + damage + " HP of damage! ";
            damage = Math.ceil(wizard.useItem(damage));
            if (damage > 0)
                document.getElementById("p_status_info").textContent += "Player loses " + damage + " HP! ";
            else if (damage == 0)
                document.getElementById("p_status_info").textContent += "Player takes no damage! ";
            else
                document.getElementById("p_status_info").textContent += "Player gains " + -damage + " HP! ";
        }
        updateSession.call(this);
        return damage;
    };
}

MagicItem.prototype.activate = function(wizard, damage) {
    var actualDamage = damage;
    switch(this.type)
    {
        case 0:
            actualDamage = damage - (damage * (this.level + 1) / 3);
            break;
        case 1:
            wizard.setHp(wizard.hp + (3 * this.level) + 3);
            break;
        case 2:
            actualDamage = 0 - (damage * (this.level + 1) / 3);
            break;
        default:
            actualDamage = damage;
    }
    return actualDamage;
};

Wizard.prototype.useItem = function(damage) {
    var whichStatusInfo;
    var newDamage = damage;
    if (this.type === "Player")
        whichStatusInfo = "p_status_info";
    else if (this.type === "Opponent")
        whichStatusInfo = "o_status_info";
    if (this.selectedItem)
    {
        document.getElementById(whichStatusInfo).textContent += this.type + " uses an item!";
        newDamage = this.selectedItem.activate(this, damage);
        if (this.selectedItem.type === 0)
            document.getElementById(whichStatusInfo).textContent += " The item is " + itemLevels[this.selectedItem.level] + " " +
                                                                    itemTypes[this.selectedItem.type] + "! ";
        else if (this.selectedItem.type === 1)
        {
            var hpHealAmount = (3 * this.selectedItem.level) + 3;
            document.getElementById(whichStatusInfo).textContent += " The item is " + itemLevels[this.selectedItem.level] + " " +
                                                                    itemTypes[this.selectedItem.type] + "! " + this.type + " heals " + hpHealAmount + " HP! ";
        }
        else if (this.selectedItem.type === 2)
            document.getElementById(whichStatusInfo).textContent += " The item is " + itemLevels[this.selectedItem.level] + " " +
                                                                    itemTypes[this.selectedItem.type] + "! ";
        var selectedIndex = this.pocket.indexOf(this.selectedItem);
        if (selectedIndex > -1)
            this.pocket.splice(selectedIndex, 1);
    }
    this.selectedItem = null;
    return newDamage;
};

if (sessionStorage.getItem("player") === null)
{
    var play = new Wizard("Player", 20, []);
    for (var i = 0; i < 4; i++)
        play.pickUpItem();
    sessionStorage.setItem("player", JSON.stringify(play));
}
if (sessionStorage.getItem("opponent") === null)
{
    var oppo = new Wizard("Opponent", 20, []);
    for (var i = 0; i < 4; i++)
        oppo.pickUpItem();
    sessionStorage.setItem("opponent", JSON.stringify(oppo));
}

var jsonPlayer = JSON.parse(sessionStorage.getItem("player"));
var jsonPlayerPocket = new Array();
for (var i = 0; i < jsonPlayer.pocket.length; i++)
    jsonPlayerPocket.push(new MagicItem(jsonPlayer.pocket[i].type, jsonPlayer.pocket[i].level, jsonPlayer.pocket[i].category));
var jsonOpponent = JSON.parse(sessionStorage.getItem("opponent"));
var jsonOpponentPocket = new Array();
for (var k = 0; k < jsonOpponent.pocket.length; k++)
    jsonOpponentPocket.push(new MagicItem(jsonOpponent.pocket[k].type, jsonOpponent.pocket[k].level, jsonOpponent.pocket[k].category));

var player = new Wizard(jsonPlayer.type, jsonPlayer.hp, jsonPlayerPocket);
var opponent = new Wizard(jsonOpponent.type, jsonOpponent.hp, jsonOpponentPocket);

function displayPocket() {
    var pocketDiv = document.getElementById("pocket");
    while (pocketDiv.firstChild)
        pocketDiv.removeChild(pocketDiv.firstChild);
    var pocketLabel = document.createElement("label");
    pocketLabel.textContent = "Available Items for Use:";
    pocketDiv.appendChild(pocketLabel);
    pocketDiv.appendChild(document.createElement("br"));
    for (var j = 0; j < player.pocket.length; j++)
    {
        var itemLabel = document.createElement("label");
        itemLabel.className = "item_label";
        itemLabel.id = "item" + (j + 1);
        itemLabel.textContent = "Use " + itemLevels[player.pocket[j].level] + " " + itemTypes[player.pocket[j].type];
        var itemRadioButton = document.createElement("input");
        itemRadioButton.type = "radio";
        itemRadioButton.name = "item";
        itemRadioButton.value = j;
        itemRadioButton.for = itemLabel.id;
        pocketDiv.appendChild(itemRadioButton);
        pocketDiv.appendChild(itemLabel);
        pocketDiv.appendChild(document.createElement("br"));
    }
    var noItemRadioButton = document.createElement("input");
    noItemRadioButton.type = "radio";
    noItemRadioButton.name = "item";
    noItemRadioButton.checked = true;
    noItemRadioButton.value = "No Item";
    pocketDiv.appendChild(noItemRadioButton);
    var noItemOptionLabel = document.createElement("label");
    noItemOptionLabel.className = "item_label";
    noItemOptionLabel.textContent = "Will not use an item";
    pocketDiv.appendChild(noItemOptionLabel);
    pocketDiv.appendChild(document.createElement("br"));
}

displayPocket();
document.getElementById("player_hp").textContent = player.hp;
document.getElementById("opponent_hp").textContent = opponent.hp;

var gameOver = false;
var alreadyClicked = false;

function isGameOver(damage, attacker, defender) {
    var gameOverFlag = false;
    if (defender.hp - damage <= 0 && attacker.hp <= 0)
    {
        document.getElementById("game_over_info").textContent += "It's a tie!";
        attacker.setHp(0);
        defender.setHp(0);
        gameOverFlag = true;
    }
    else if (defender.hp - damage <= 0)
    {
        document.getElementById("game_over_info").textContent += attacker.type + " Wins! " + defender.type + " Faints!";
        defender.setHp(0);
        gameOverFlag = true;
    }
    else if (attacker.hp <= 0)
    {
        document.getElementById("game_over_info").textContent += defender.type + " Wins! " + attacker.type + " Faints!";
        attacker.setHp(0);
        gameOverFlag = true;
    }
    else
    {
        defender.setHp(defender.hp-damage);
        gameOverFlag = false;
    }
    return gameOverFlag;
}

var resetGame = function() {
    if (!alreadyClicked || gameOver)
    {
	player.reset();
	opponent.reset();
	player.pickUpItem();
	player.pickUpItem();
	player.pickUpItem();
	player.pickUpItem();
	opponent.pickUpItem();
	opponent.pickUpItem();
	opponent.pickUpItem();
	opponent.pickUpItem();
	document.getElementById("player_hp").textContent = player.hp;
	document.getElementById("opponent_hp").textContent = opponent.hp;
	gameOver = false;
	document.getElementById("game_over_info").textContent = "";
	document.getElementById("p_status_info").textContent = "";
	document.getElementById("o_status_info").textContent = "";
	alreadyClicked = false;
	displayPocket();
	player.selectedItem = null;
	opponent.selectedItem = opponent.pocket[0];
    }
};

resetButtons = document.getElementsByClassName("reset");
for (var j = 0; j < resetButtons.length; j++)
  resetButtons[j].addEventListener("click", resetGame);

document.getElementById("turn").addEventListener("click", function() {
    var itemsInPocket = document.getElementsByName("item");
    for (var i = 0; i < itemsInPocket.length - 1; i++)
    {
        if (itemsInPocket[i].checked)
        {
            player.selectedItem = player.pocket[itemsInPocket[i].value];
            break;
        }
    }
    var damage;
    if (!alreadyClicked)
    {
        alreadyClicked = true;
        if (!gameOver)
        {
            document.getElementById("game_over_info").textContent = "";
            document.getElementById("p_status_info").textContent = "";
            document.getElementById("o_status_info").textContent = "";
            opponent.selectedItem = opponent.pocket[0];
            damage = player.attack(opponent);
            gameOver = isGameOver(damage, player, opponent);
            document.getElementById("player_hp").textContent = player.hp;
            document.getElementById("opponent_hp").textContent = opponent.hp;
        }
        if (!gameOver)
        {
            document.getElementById("p_status_info").textContent = "Opponent Responds With...   ";
            setTimeout(function() {            
                damage = opponent.attack(player);
                gameOver = isGameOver(damage, opponent, player);
                document.getElementById("player_hp").textContent = player.hp;
                document.getElementById("opponent_hp").textContent = opponent.hp;
                alreadyClicked = false;
                displayPocket();
            }, 1500);
        }
    }
});
