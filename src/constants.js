class Kushmander {
    constructor() {
        this.name = "Kushmander";
        this.symbol = "MANDER";
        this.description = "Obviously prefers to be faded";
        this.stage = "1";
        this.hp = "60";
        this.background = "Non-holo";
        this.attack = "30";
        this.type = "fire";
        this.totalCards = 33
        Object.freeze(this);
    }
}

class Kushmeleon {
    constructor() {
        this.name = "Kushmeleon";
        this.symbol = "MELEON";
        this.description = "Heh, uhsuhhh dude";
        this.stage = "2";
        this.hp = "80";
        this.background = "Non-holo";
        this.attack = "50";
        this.type = "fire";
        this.totalCards = 33
        Object.freeze(this);
    }
}

class Kushuhzard {
    constructor() {
        this.name = "Kushuhzard";
        this.symbol = "UHZARD";
        this.description = "I axed the pastor whats the fastest way to heaven for a bastard with a tarnished past give me an honest answer";
        this.stage = "3";
        this.hp = "120";
        this.background = "HOLO";
        this.attack = "120";
        this.type = "fire";
        this.totalCards = 34
        Object.freeze(this);
    }
}

class Squizzle {
    constructor() {
        this.name = "Squizzle";
        this.symbol = "SQUIZZ";
        this.description = "Mellow mood has got me";
        this.stage = "1";
        this.hp = "60";
        this.background = "Non-holo";
        this.attack = "30";
        this.type = "water";
        this.totalCards = 33
        Object.freeze(this);
    }
}

class Wartizzle {
    constructor() {
        this.name = "Wartizzle";
        this.symbol = "WARTIZ";
        this.description = "Every time im in the streets I hear ghyat ghyat ghyat ghyat";
        this.stage = "2";
        this.hp = "60";
        this.background = "Non-holo";
        this.attack = "30";
        this.type = "water";
        this.totalCards = 33
        Object.freeze(this);
    }
}

class Blastizzle {
    constructor() {
        this.name = "Blastizzle";
        this.symbol = "BLASTIZ";
        this.description = "A brutal Tokemon with a thuggish mentality";
        this.stage = "3";
        this.hp = "100";
        this.background = "HOLO";
        this.attack = "60";
        this.type = "water";
        this.totalCards = 34
        Object.freeze(this);
    }
}

class Bowlbuhsaur {
    constructor() {
        this.name = "Bowlbuhsaur";
        this.symbol = "BOWLBUH";
        this.description = "That shit on its back got some shit on its back";
        this.stage = "1";
        this.hp = "60";
        this.background = "Non-holo";
        this.attack = "20";
        this.type = "grass";
        this.totalCards = 33
        Object.freeze(this);
    }
}

class OGIvy {
    constructor() {
        this.name = "OGIvy";
        this.symbol = "OGIVY";
        this.description = "He gets the snicklefritz";
        this.stage = "2";
        this.hp = "90";
        this.background = "Non-holo";
        this.attack = "40";
        this.type = "grass";
        this.totalCards = 33
        Object.freeze(this);
    }
}

class Psilocybasaur {
    constructor() {
        this.name = "Psilocybasaur";
        this.symbol = "PSILO";
        this.description = "It draws its power from the spirit molecule";
        this.stage = "3";
        this.hp = "120";
        this.background = "HOLO";
        this.attack = "100";
        this.type = "grass";
        this.totalCards = 34
        Object.freeze(this);
    }
}


const tokemonMap = {
    Kushmander,
    Kushmeleon,
    Kushuhzard,
    Squizzle,
    Wartizzle,
    Blastizzle,
    Bowlbuhsaur,
    OGIvy,
    Psilocybasaur
};

module.exports = {tokemonMap}