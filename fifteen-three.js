

/* DOM ELEMENTS */
const throwbutton = document.querySelector('#roll');
const calculation = document.querySelector('#calculation');
const die1 = document.querySelector('#die1');
const die2 = document.querySelector('#die2');
const die3 = document.querySelector('#die3');
const operators = document.querySelector('#operators');
const errorfield = document.querySelector('#errorfield');
const rollresults = document.querySelector('#rollresults');
const introform = document.querySelector('#introform');
const playerform = document.querySelector('#playerform');

let currentterm = '';
let state = 'intro';
const winnerpatters = {
    15: [ [5,5,5,'5+5+5'] ],
    14: [],
    13: [],
    12: [],
    11: [],
    10: [],
    9: [],
    8: [],
    7: [],
    6: [],
    5: [],
    4: [],
    3: []
}
let game = {
    players: [],
    currentplayer: 0
};

const init = () => {
    setstate('intro');
    throwbutton.className = 'active';
    rollresults.className = 'hidden';
    operators.className = 'hidden';
}

const gameover = (loser) => {
    let lossessort = game.players.sort((a,b) => {return a.losses < b.losses});
    document.querySelector('#endscores').innerHTML = '';
}

// Intro 
const getplayernames = (ev) => {
    var out = '';
    var template = document.querySelector('#playerlist template').cloneNode(true);
    for (let i = 0; i < document.querySelector('#players').value; i++) {
        out += template.innerHTML.replace(/\$count/g, i + 1);
    }
    templatereplace('#playerlist', out, true);
//    document.querySelector('#playerlist').innerHTML = out;
    setstate('nameentry');
    ev.preventDefault();
}
// Player Entry 
const addplayerstogame = (ev) => {
    for (let i = 0; i < document.querySelector('#players').value; i++) {
        let field = document.querySelector('#player' + (i+1));
        game.players.push({
            name: field.value,
            score: 0,
            losses: 0
        })
    }
    ev.preventDefault();
    startgame();
};

// New Game

const startgame = () => {
    setstate('playing');
    rollresults.className = 'hidden';
    drawplayer(game);
    drawscore(game);
    errorfield.className = 'hidden';
};

const drawplayer = (game) => {
    templatereplace('#playerinfo', {
        'name': game.players[game.currentplayer].name,
        'score': game.players[game.currentplayer].score,
        'losses': game.players[game.currentplayer].losses
    }, true);
    // showmessage(game.players[game.currentplayer].name + "'s turn");
}

const drawscore = (game) => {
    let table = document.querySelector('#gamescore');
    let out = '<thead><tr>';
    game.players.forEach(p => { out += `<th colspan="2">${p.name}</th>`; });
    out += '</tr><tr>';
    game.players.forEach(p => { out += `<th>Score</th><th>Losses</th>`; });
    out += '</tr></thead><tr>';
    game.players.forEach(p => { out += `<td>${p.score}</td><td>${p.losses}</td>`; });
    out += '</tr></table>';
    table.innerHTML = out;
}

throwbutton.addEventListener('click',(ev) => {
    rollthem();
    ev.preventDefault();
});

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
        clearresult();
        return;
    } 
    if (t.dataset.val === 'done') {
        if (currentterm === '') {
            errorfield.innerHTML = 'Nothing to calculate :(';
            calculation.className = 'error';
            errorfield.className = '';
            return;
         }
         try {
            eval(currentterm);
        } catch (e) {
            errorfield.innerHTML = 'This is not a valid term';
            calculation.className = 'error';
            errorfield.className = '';
            return;
        }
        let finalvalue = eval(currentterm);
        if (finalvalue < 0) {
            errorfield.className = '';
            errorfield.innerHTML = 'This is less than zero :(';
        }
        if (finalvalue > 15) {
            errorfield.innerHTML = 'This is more than 15 :(';
            calculation.className = 'error';
            errorfield.className = '';
        } 
        if (finalvalue >= 0 && finalvalue < 16) {
            calculation.innerHTML = currentterm + ' = ' + eval(currentterm);
            rollresults.className = 'hidden';
            errorfield.className = '';
            throwbutton.className = ''; 
            advancegame(finalvalue);
        }
        return;
    } 
    currentterm += t.dataset.val;
    calculation.innerHTML = currentterm;
    ev.preventDefault();
}

const advancegame = (finalvalue) => {
    game.players[game.currentplayer].score = finalvalue;
    errorfield.className = 'hidden';
    operators.className = 'hidden';
    if (game.currentplayer + 1 < game.players.length) {
        game.currentplayer += 1;
        clearresult();
        startgame();
    } else {
        drawscore(game);
        let scores = [];
        let scoresort = game.players.sort((a,b) => {return a.score > b.score});
        if (scoresort[0].score < scoresort[1].score) {
            let loser = '';
            game.players.forEach( (p,k) => {
                if (p.name === scoresort[0].name){
                    game.players[k].losses += 1
                    loser = game.players[k];
                }
            });
            if (loser.losses === 5){
                setstate('gameover');
                gameover(loser);
            } else {
                game.players.forEach((p)=>p.score = 0);
                game.currentplayer = 0;
                showmessage(loser.name + ' lost this round.', () => {
                    clearresult();
                    startgame();
                });
           }
        } else {
            showmessage('No single loser this round!');
            game.currentplayer = 0;
            clearresult();
            startgame();
        }
    }
}


const rollthem = (ev) => {
    let valueone = throwdice();
    let valuetwo = throwdice();
    let valuethree = throwdice();
    die1.title = die1.dataset.val = valueone;
    die2.title = die2.dataset.val = valuetwo;
    die3.title = die3.dataset.val = valuethree;
    die1.className = `dice dice-${valueone}`;
    die2.className = `dice dice-${valuetwo}`;
    die3.className = `dice dice-${valuethree}`;
    throwbutton.className = 'throwactive';
    rollresults.className = '';
    operators.className = '';
};

/* HELPER FUNCTIONS */
const setstate = (state) => {
    document.body.className = state;
}

const templatereplace = (id, content) => {
    let newcontent = '';
    if (document.querySelector(id + ' .temporary')) {
        document.querySelector(id + ' .temporary').remove();
    };
    let t = document.querySelector(id + ' template');
 
    if (typeof content === 'object') {
        newcontent = t.innerHTML;
        Object.keys(content).forEach((key) => {
            let pattern = new RegExp('\\$' + key, 'g');
            newcontent = newcontent.replace(pattern, content[key]);
        });
    } else {
        newcontent = content;
    }
    let dummy = document.createElement('div');
    dummy.className = 'temporary';
    dummy.innerHTML = newcontent;
    t.parentNode.insertBefore(dummy, t);
}

const showmessage = (message, func) => {
    document.querySelector('#message div').innerHTML = message;
    document.querySelector('#message').className = '';
    document.querySelector('#message button').addEventListener('click', (ev) => {
        document.querySelector('#message').className = 'hidden';
        if (func) {func()}
    });
}

const clearresult = () => {
    errorfield.innerHTML = '';
    errorfield.className = 'hidden';
    currentterm = '';
    calculation.innerHTML = '';
    calculation.className = '';
    die1.classList.remove('selected');
    die2.classList.remove('selected');
    die3.classList.remove('selected');
};

const throwdice = () => {
    return ~~(Math.random() * 6) + 1;
}

/* EVENT HANDLERS */
playerform.addEventListener('submit', addplayerstogame);
introform.addEventListener('submit', getplayernames);
operators.addEventListener('click' ,operatorfunctions);
rollresults.addEventListener('click', getdice);
window.addEventListener('DOMContentLoaded', init);
