
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
const playbutton      = document.querySelector('#playgame');
const gamescreen      = document.querySelector('#game');
const introscreen     = document.querySelector('#intro');
const gameoverscreen  = document.querySelector('#gameover');

let currentterm = '';
let config = {};
let currentplayer = 0;
let players = localStorage.playercache ?  JSON.parse(localStorage.playercache) : [];

const init = () => {

    fetch('gameconfig.json').then(function(response) {
        return response.text();
      }).then(function(text) {
        config = JSON.parse(text);
    });

    restartbutton.addEventListener('click', setupgame);
    throwbutton.addEventListener('click', rollthem);
    rollresults.addEventListener('click', getdice);
    operators.addEventListener('click', operatorfunctions);
    progressbar.addEventListener('animationend' ,outoftime);
    addplayerbutton.addEventListener('click', toggleplayerform);
    playerform.addEventListener('submit', addplayer);
    playerform.querySelector('ul').addEventListener('click', removeplayer);
    addplayerbutton.innerHTML = players.length > 0 ? '+' : 'Add Player';
    setupgame();
}

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
        let deadplayer = players.splice(t.dataset.num, 1)
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
        item.dataset.score = 0;
        item.innerHTML= `
            ${p.name}
            <span>${p.score}</span>
            <a data-num="${k}"href="#">x</a>
        `;
        list.appendChild(item);
    });
};

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

const advanceplayers = () => {
    if (players.length > 0) {
        if (players[currentplayer].score >= config.gameendscore) {
            gameover();
        } else {
            currentplayer = (currentplayer + 1) % players.length;
            populateplayers(currentplayer);
       }
    }
}
const gameover = () => {
    setsection(gameoverscreen);
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

const rollthem = (ev) => {
    progress.className = 'animated';
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

/* HELPER FUNCTIONS */

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
    [gameoverscreen, gamescreen, introscreen].forEach(s => {
        s.classList.add('hidden');
    })
    stateid.classList.remove('hidden');
}
const setupgame = (ev) => {
    players.forEach(p => {
        p.score = 0;
    });
    currentplayer = 0;
    currentterm = '';
    populateplayers(currentplayer);
    [throwbutton, operators, calculation, playersection].forEach(s => {
        s.classList.remove('hidden');
    })
    calculation.classList.remove('error');
    errorfield.classList.add('hidden');
    rollresults.classList.add('hidden');
    errorfield.innerHTML = '';
    calculation.innerHTML = '';
    setsection(gamescreen);
    if (ev) {ev.preventDefault()}
};

const throwdice = () => {
    return ~~(Math.random() * 6) + 1;
}

/* EVENT HANDLERS */
window.addEventListener('DOMContentLoaded', init);

