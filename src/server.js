const express = require('express');
const db = require('./db');
var cors = require('cors');

// var allowlist = ['http://localhost/APIjavascript/apiClient/', 'http://localhost:3003', 'http://localhost', 'http://localhost:3003/delete', 'http://localhost:3003/update'];
var allowlist = ['http://localhost'];
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    console.log('Origem: '+req.header('Origin'))
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false } // disable CORS for this request
    }
    // corsOptions = { origin: true }
    callback(null, corsOptions) // callback expects two parameters: error and options
  }

const app = express();

app.use(express.json());

const PORT = 3003;

app.listen(3003, () => { console.log(`Funcionando na porta ${PORT}`) });

app.get('/', cors(corsOptionsDelegate), async (req, res) => {
    console.log('Funcionando até aqui')
    const query = await db.allUsers();
    // const query = {'nome': 'Robson Farias', 'Idade': 37};
    return res.status(200).json(query);
});

app.get('/:id', cors(corsOptionsDelegate), async (req, res) => {
    const results = await db.pesUserId(req.params.id);
    console.log('Pesquisa por id: '+req.params.id);
    return res.status(200).json(results);
});

app.get('/name/:name', cors(corsOptionsDelegate), async (req, res) => {
    const results = await db.pesUserName(req.params.name);
    console.log('Pesquisa por Nome: '+req.params.name);
    return res.status(200).json(results);
});

app.use(express.urlencoded({ extended: true }));

app.post('/create', cors(corsOptionsDelegate), async (req, res) => {
    const {name, city} = req.body;
    const create = await db.create(name, city);
    // return res.status(200).json(create);
    if(create){
        const user = await db.pesUserName(name);
        return res.status(200).json(user);
    }else{
        return res.status(200).json({"msg": "Erro na criação"});
    }
});

app.post('/update/', cors(corsOptionsDelegate), async (req, res) => {
    // const {id, name, city} = req.body;
    try{
        console.log(req.body)
        const id = req.body.id;
        const name = req.body.name;
        const city = req.body.city;
        // console.log(id+'+++++++++++');
        // console.log(name+'**********');
        // console.log(city+'-----------');
        const update = await db.updateUser(id, name, city);
        console.log(update);
        return res.status(200).json(update);
    }catch(error){
        console.log(error+'...............')
        return res.status(500).send(1);
    }
});


app.post('/delete/', cors(corsOptionsDelegate), async (req, res) => {
    try{
        const id = req.body.id;
        console.log(id+'+++++++++++');
        const del = await db.deleteUser(id);
        return res.status(200).json(del);
    }catch(error){
        console.log(error)
        return res.status(500).send(1);
    }
})