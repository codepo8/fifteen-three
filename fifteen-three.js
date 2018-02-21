
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
const winnerpatterns = {
    "111": [3,  "1 + 1 + 1"],
    "112": [4,  "2 * (1 + 1)"],
    "113": [6,  "3 * (1 + 1)"],
    "114": [8,  "4 * (1 + 1)"],
    "115": [10, "5 * (1 + 1)"],
    "116": [12, "6 * (1 + 1)"],
    "122": [6,  "(1 + 2) * 2"],
    "123": [9,  "(1 + 2) * 3"],
    "124": [12, "(1 + 2) * 4"],
    "125": [15, "(1 + 2) * 5"],
    "126": [14, "(1 + 6) * 2"],
    "133": [15, ""],
    "134": [15,""],
    "135": [15,""],
    "136": [15,""],
    "144": [15,""],
    "145": [15,""],
    "146": [15,""],
    "155": [15,""],
    "156": [15,""],
    "166": [15,""],
    "222": [15,""],
    "223": [15,""],
    "224": [15,""],
    "225": [15,""],
    "226": [15,""],
    "233": [15,""],
    "234": [15,""],
    "235": [15,""],
    "236": [15,""],
    "244": [15,""],
    "245": [15,""],
    "246": [15,""],
    "255": [15,""],
    "256": [15,""],
    "266": [15,""],
    "333": [15,""],
    "334": [15,""],
    "335": [15,""],
    "336": [15,""],
    "344": [15,""],
    "345": [15,""],
    "346": [15,""],
    "355": [15,""],
    "356": [15,""],
    "366": [15, "6 + 6 + 3"],
    "444": [12, "4 + 4 + 4"],
    "445": [13, "4 + 4 + 5"],
    "446": [14, "4 + 4 + 6"],
    "455": [14, "4 + 5 + 5"],
    "456": [15, "4 + 5 + 6"],
    "466": [12, "(6 - 4) * 6"],
    "555": [15, "5 + 5 + 5"],
    "556": [6,  "(6 + 5) - 5"],
    "566": [7,  "(6 + 6) - 5"],
    "666": [6,  "6 + 6 - 6 = 6"]
}

const init = () => {
    throwbutton.className = 'active';
    rollresults.className = 'hidden';
    errorfield.className = 'hidden';
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
    fullscore.innerHTML = winnerpatterns[valuematch.join('')][0];
    fullscore.dataset.bestvalue = winnerpatterns[valuematch.join('')][0];
    console.log(winnerpatterns[valuematch.join('')][1]);
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
progressbar.addEventListener('animationend' ,(ev) => console.log(ev));
operators.addEventListener('click' ,operatorfunctions);
rollresults.addEventListener('click', getdice);
throwbutton.addEventListener('click',rollthem);
window.addEventListener('DOMContentLoaded', init);

