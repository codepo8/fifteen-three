
/* DOM ELEMENTS */
const throwbutton = document.querySelector('#roll');
const calculation = document.querySelector('#calculation');
const die1 = document.querySelector('#die1');
const die2 = document.querySelector('#die2');
const die3 = document.querySelector('#die3');
const operators = document.querySelector('#operators');
const errorfield = document.querySelector('#errorfield');
const rollresults = document.querySelector('#rollresults');
const progress = document.querySelector('#progressbar');
const fullscore = document.querySelector('#tomatch');
let currentterm = '';
let config = {};
let edited = null;
let players = [];

document.querySelector('#players').addEventListener('click', (ev) => {
    let t = ev.target;
    if (t.tagName === 'INPUT' && t.type === "button") {
        t.type = "text";
        t.select();
        edited = t;
    }
}); 
document.querySelector('#players form').addEventListener('submit', (ev) => {
    edited.type = "button";
    ev.preventDefault();
}); 



const init = () => {
    throwbutton.className = 'active';
    rollresults.className = 'hidden';
    errorfield.className = 'hidden';

    fetch('gameconfig.json').then(function(response) {
        console.log(response);
        return response.text();
      }).then(function(text) {
        config = JSON.parse(text);
        console.log(config);
    });

}

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
            calculation.innerHTML = currentterm + ' = ' + eval(currentterm);
            rollresults.className = 'hidden';
            calculation.classList.remove('error');
            errorfield.className = 'hidden';
            throwbutton.className = ''; 
            progressbar.classList.remove('animated');
        }
        return;
    } 
    currentterm += t.dataset.val;
    calculation.innerHTML = currentterm;
    ev.preventDefault();
}

const rollthem = (ev) => {
    progress.className = 'animated';
    let valueone = throwdice();
    let valuetwo = throwdice();
    let valuethree = throwdice();
    let valuematch = [valueone, valuetwo, valuethree].sort();
    fullscore.innerHTML = config.winnerpatterns[valuematch.join('')][0];
    fullscore.dataset.bestvalue = config.winnerpatterns[valuematch.join('')][0];
    // console.log(winnerpatterns[valuematch.join('')][1]);
    die1.title = die1.dataset.val = valueone;
    die2.title = die2.dataset.val = valuetwo;
    die3.title = die3.dataset.val = valuethree;
    die1.className = `dice dice-${valueone}`;
    die2.className = `dice dice-${valuetwo}`;
    die3.className = `dice dice-${valuethree}`;
    throwbutton.className = 'throwactive';
    rollresults.className = '';
    operators.className = '';
    ev.preventDefault();
};

const outoftime = () => {
    operators.className = 'hidden';
    errorfield.innerHTML = config.errormessages.outoftime;
    errorfield.className = '';
}

/* HELPER FUNCTIONS */

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
progressbar.addEventListener('animationend' ,outoftime);
operators.addEventListener('click' ,operatorfunctions);
rollresults.addEventListener('click', getdice);
throwbutton.addEventListener('click',rollthem);
window.addEventListener('DOMContentLoaded', init);

