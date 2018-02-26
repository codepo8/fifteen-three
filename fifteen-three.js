/* DOM ELEMENTS */
const throwbutton     = document.querySelector('#roll');
const calculation     = document.querySelector('#calculation');
const die1            = document.querySelector('#die1');
const die2            = document.querySelector('#die2');
const die3            = document.querySelector('#die3');
const operators       = document.querySelector('#operators');
const errorfield      = document.querySelector('#errorfield');
const rollresults     = document.querySelector('#rollresults');
const progress        = document.querySelector('#progressbar');
const fullscore       = document.querySelector('#tomatch');
const playersection   = document.querySelector('#players');
const addplayerbutton = document.querySelector('#addplayer');
const playerform      = document.querySelector('#playerlist');
const playername      = document.querySelector('#playername');
const restartbutton   = document.querySelector('#newgame');
const gamescreen      = document.querySelector('#game');
const creditscreen    = document.querySelector('#credits');
const introscreen     = document.querySelector('#intro');
const gameoverscreen  = document.querySelector('#gameover');
const turnmessage     = document.querySelector('#turnmessage')
const roundlabel      = document.querySelector('#rounds');

let currentterm = '';
let config = {};
let movetime = null;
let currentplayer = 0;
let players = localStorage.playercache ?  JSON.parse(localStorage.playercache) : [];

const init = () => {
    restartbutton.addEventListener('click', setupgame);
    throwbutton.addEventListener('click', rollthem);
    rollresults.addEventListener('click', getdice);
    operators.addEventListener('click', operatorfunctions);
    progress.addEventListener('animationend' ,outoftime);
    addplayerbutton.addEventListener('click', toggleplayerform);
    playerform.addEventListener('submit', addplayer);
    playerform.querySelector('ul').addEventListener('click', removeplayer);
    setuptextscreens([
        ['intro', introscreen],
        ['credits', creditscreen]
    ]);
    fetch('gameconfig.json').then(function(response) {
        return response.text();
      }).then(function(text) {
        config = JSON.parse(text);
        setupgame();
    });
}

/* Player controls */
const addplayer = (ev) => {
    ev.preventDefault();
    if (playername.value !== '') {
        players.push(
            {"name": playername.value, "score": 0}
        );
        playername.value = '';
        playername.classList.remove('show');
        populateplayers(currentplayer);
    }
};

const removeplayer = (ev) => {
    let t = ev.target;
    if (t.tagName === "A" && t.parentNode.tagName === 'LI') {
        let deadplayer = players.splice(t.dataset.num, 1);
        populateplayers(currentplayer);
    }
    ev.preventDefault();
}

const toggleplayerform = (ev) => {
    playername.classList.toggle('show');
    playername.focus();
}

const populateplayers = (turn) => {
    localStorage.playercache = JSON.stringify(players);
    playerform.querySelector('ul').innerHTML = '';
    players.forEach((p, k) => {
        let list =  document.querySelector('#playerlist ul');
        let item = document.createElement('li');
        if (k === turn) {
            item.classList.add('currentplayer');
        }
        item.dataset.num = k;
        item.dataset.score = '0';
        item.innerHTML= `
            ${p.name}:
            <span>${p.score}</span>
            <a data-num="${k}"href="#">x</a>
        `;
        list.appendChild(item);
    });
    if (players.length > 0) {
        addplayerbutton.classList.add('compact');
        addplayerbutton.innerHTML = config.labels.buttons.addplayercompact;
    }   else {
        addplayerbutton.classList.remove('compact');
        addplayerbutton.innerHTML = config.labels.buttons.addplayerfull;
    }     
};

const advanceplayers = () => {
    if (players.length > 0) {
        if (players[currentplayer].score >= config.gameendscore) {
            gameover();
        } else {
            currentplayer = (currentplayer + 1) % players.length;
            if (currentplayer === 0) {
                game.turns++;
                updaterounds();
            }
            throwbutton.innerHTML = players[currentplayer].name + ', roll the dice!';
            populateplayers(currentplayer);
       }
    }
}

const updaterounds = () => {
    roundlabel.innerHTML = config.labels.rounds.replace('$round', game.turns);
 };

/* Dice controls */
const getdice = (ev) => {
    let t = ev.target;
    if (t.tagName !== 'BUTTON') {return;}
    if (!t.classList.contains('selected')) {
        currentterm += t.dataset.val;
        calculation.innerHTML = currentterm;
        t.classList.add('selected');
    }
    ev.preventDefault();
};

const operatorfunctions = (ev) => {
    let t = ev.target;
    if (t.tagName !== 'BUTTON') {return;}
    if (t.dataset.val === 'delete') {
        clearmove();
        return;
    } 
    if (t.dataset.val === 'done') {
        if (currentterm === '') {
            errorfield.innerHTML = config.errormessages.noterm;;
            calculation.className = 'error';
            errorfield.className = '';
            return;
         }
         try {
            eval(currentterm);
        } catch (e) {
            errorfield.innerHTML = config.errormessages.invalidterm;
            calculation.className = 'error';
            errorfield.className = '';
            return;
        }
        let finalvalue = eval(currentterm);
        if (finalvalue < 0) {
            errorfield.className = '';
            errorfield.innerHTML = config.errormessages.lessthanzero;
        }
        if (finalvalue > 15) {
            errorfield.innerHTML = config.errormessages.morethan15;
            calculation.className = 'error';
            errorfield.className = '';
        } 
        if (finalvalue >= 0 && finalvalue < 16) {
            calculation.innerHTML = currentterm + ' = ' + finalvalue;
            if (fullscore.dataset.bestvalue > finalvalue) {
                if (players.length > 0) {
                    players[currentplayer].score += fullscore.dataset.bestvalue - finalvalue;
                }
            }
            advanceplayers();
            rollresults.className = 'hidden';
            calculation.classList.remove('error');
            errorfield.className = 'hidden';
            throwbutton.className = ''; 
            progressbar.classList.remove('animated');
    
        }
        return;
    }
    currentterm += ' ' + t.dataset.val + ' ';
    calculation.innerHTML = currentterm;
    ev.preventDefault();
}

const rollthem = (ev) => {
    progress.className = 'animated';
    // timer(20000); - maybe later :) 
    let valueone = throwdice();
    let valuetwo = throwdice();
    let valuethree = throwdice();
    let valuematch = [valueone, valuetwo, valuethree].sort();
    fullscore.innerHTML = config.winnerpatterns[valuematch.join('')][0];
    fullscore.dataset.bestvalue = config.winnerpatterns[valuematch.join('')][0];
    die1.title = die1.dataset.val = valueone;
    die2.title = die2.dataset.val = valuetwo;
    die3.title = die3.dataset.val = valuethree;
    die1.className = `dice dice-${valueone}`;
    die2.className = `dice dice-${valuetwo}`;
    die3.className = `dice dice-${valuethree}`;
    throwbutton.className = 'hidden';
    rollresults.className = '';
    operators.className = '';
    calculation.innerHTML = '';
    errorfield.className = 'hidden';
    currentterm = '';
    ev.preventDefault();
};

/* Error / Game End Handling */
const outoftime = () => {
    operators.className = 'hidden';
    progress.className = '';
    rollresults.className = 'hidden';
    errorfield.innerHTML = config.errormessages.outoftime;
    errorfield.className = '';
    throwbutton.className = '';
    if (players.length > 0) {
        players[currentplayer].score += +fullscore.dataset.bestvalue;
    }
    advanceplayers();
}

const gameover = () => {
    setsection(gameoverscreen);
    turnmessage.innerHTML = config.messages.gameoverturnmessage.replace('$turns', game.turns);
    let playerscore = players.slice(0);
    playerscore.sort((a,b) => {
        return a.score > b.score
    });
    let out = '';
    playerscore.forEach((p) => {
        out += `<li>${p.name}: ${p.score}</li>`;
    });
    gameoverscreen.querySelector('ol').innerHTML = out;
}

/* HELPER FUNCTIONS */

const cancelcountdown = () => {

}

const timer = (seconds) => {
    let now = new Date();
    movetime = window.setTimeout(outoftime, seconds);
};

const clearmove = () => {
    errorfield.innerHTML = '';
    calculation.innerHTML = '';
    currentterm = '';
    errorfield.classList.add('hidden');
    calculation.classList.remove('error');
    die1.classList.remove('selected');
    die2.classList.remove('selected');
    die3.classList.remove('selected');
}

const setsection = (stateid) => {
    [gameoverscreen, gamescreen, introscreen, creditscreen].forEach(s => {
        s.classList.add('hidden');
    });
    stateid.classList.remove('hidden');
}
const setupgame = (ev) => {
    players.forEach(p => {
        p.score = 0;
    });
    currentplayer = 0;
    currentterm = '';
    game.turns = 1;
    updaterounds();
    populateplayers(currentplayer);
    [throwbutton, operators, calculation, playersection].forEach(s => {
        s.classList.remove('hidden');
    })
    calculation.classList.remove('error');
    errorfield.classList.add('hidden');
    rollresults.classList.add('hidden');
    errorfield.innerHTML = '';
    calculation.innerHTML = '';
    throwbutton.innerHTML = players.length > 0 ?
        config.labels.buttons.multiplayerroll.replace(
            '$name', players[currentplayer].name
        ): 
        config.labels.buttons.singleplayerroll;
    setsection(gamescreen);
    if (ev) {ev.preventDefault()}
};

const setuptextscreens = (screendata) => {
    screendata.forEach((s) => {
        document.querySelector('a[href="#' + s[0] +  '"').addEventListener('click', (ev) => {
            ev.preventDefault();
            setsection(s[1]);
        });
        document.querySelector('#' + s[0] + ' button').addEventListener('click', (ev) => {
            ev.preventDefault();
            setsection(gamescreen);
        });
    });
};

const throwdice = () => {
    return ~~(Math.random() * 6) + 1;
}

window.addEventListener('DOMContentLoaded', init);

