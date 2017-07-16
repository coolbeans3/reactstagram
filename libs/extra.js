function rollDice(){
    var n = Math.floor((Math.random() * 6) + 1);
    return n
}

function guessmyAge(){
    var m = Math.floor((Math.random() * 100) + 1);
    return m
}

function randomTenLetterString(){
    var string = (Math.random() + 1).toString(36).substr(2, 10)
    return string
}
var exports = {
    rollDice: rollDice,
    guessmyAge: guessmyAge,
    randomTenLetterString: randomTenLetterString,
}

module.exports = exports;