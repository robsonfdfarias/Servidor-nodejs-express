const express = require('express');
const app = express();
const db = require('./src/db');
const md5 = require("md5");

// Efetua o parse do application/json
const bodyParser = require('body-parser');
app.use(bodyParser.json());


app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});


app.use(express.urlencoded({ extended: true }));
var cors = require('cors');
var allowlist = ['http://localhost'];
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    console.log('Origem: '+req.header('Origin'))
    console.log('Usuario: '+req.body.usuario)
    console.log('Senha: '+req.body.senha)
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false } // disable CORS for this request
    }
    corsOptions = { origin: true }
    callback(null, corsOptions) // callback expects two parameters: error and options
}



const validarJWT = (req, res, next) => {
  const jwt = req.headers['authorization'];
  const chavePrivada = "infocomrobson.com.br";

  //efetuar a validação do JWT
  const jwtService = require("jsonwebtoken");
  jwtService.verify(jwt, chavePrivada, (err, userInfo) => {
    if(err){
      res.status(403).end();
      return;
    }
    // O objeto "req" é alterado abaixo
      // recebendo uma nova propriedade userInfo.
      // Este mesmo objeto chegará na rota
      // podendo acessar o req.userInfo
    req.userInfo = userInfo;
    next();
  });
}

app.get(
    "/status",
    (req, res) => res.json({ status: "OK" })
);

app.listen(3000, () => {
  console.log("Aplicacao em execucao");
});

// app.post(
//     "/login", cors(corsOptionsDelegate),
//     async (req, res) => {
//         // ************************************
//         // Observação: o comando abaixo
//         // const { usuario, senha } = req.body;
//         // é a mesma coisa que digitar:
//         // const usuario = req.body.usuario;
//         // const senha = req.body.senha;
//         // ************************************
//         const { usuario, senha } = req.body;
  
//         if (usuario === "marcelo" && senha === "123456") {
//             const jwt = require("jsonwebtoken");
//             const dadosUsuario = {
//                 nome: "marcelo",
//                 email: "teste@gmail.com",
//                 id: 1
//             };
            
//             const chavePrivada = "consolelog.com.br";
  
//             jwt.sign(dadosUsuario, chavePrivada, (err, token) => {
//                 if (err) {
//                     res
//                         .status(500)
//                         .json({ mensagem: "Erro ao gerar o JWT" });
  
//                     return;
//                 }
//                 res.set("x-access-token", token).json({"status":true, "token": token});
//                 res.end();
//             });
//         } else {
//             res.status(401).json({"status":false});
//             res.end();
//         }
//     }
//   );

app.post(
  "/login", cors(corsOptionsDelegate),
  async (req, res) => {
      // ************************************
      // Observação: o comando abaixo
      // const { usuario, senha } = req.body;
      // é a mesma coisa que digitar:
      // const usuario = req.body.usuario;
      // const senha = req.body.senha;
      // ************************************
      const { usuario, senha } = req.body;
        const login = await db.login(usuario, md5(senha));

      if (login[0]!=null) {
          const jwt = require("jsonwebtoken");
          const dadosUsuario = {
              nome: login[0].name,
              email: login[0].email,
              id: login[0].id
          };
          
          const chavePrivada = "infocomrobson.com.br";

          jwt.sign(dadosUsuario, chavePrivada, (err, token) => {
              if (err) {
                  res
                      .status(500)
                      .json({ mensagem: "Erro ao gerar o JWT" });
                  return;
              }
              res.set("x-access-token", token).json({"status":true, "token": token});
              res.end();
          });
      } else {
          res.status(401).json({"status":false});
          res.end();
      }
  }
);

app.get(
  "/user", validarJWT,
  async (req, res) => {
    const login = await db.login("robsonfdfarias@gmail.com", md5("manaus123"));
    if(login[0]!=null){
        // console.log(login)
        console.log(login[0].name)
    }else{
        console.log('Não tem conteúdo')
    }
          res.json(req.userInfo);
  }
);

app.get('/name/:name', validarJWT, async (req, res) => {
    const results = await db.pesUserName(req.params.name);
    console.log('Pesquisa por Nome: '+req.params.name);
    return res.status(200).json(results);
});

app.get('/:id', validarJWT, async (req, res) => {
  const results = await db.pesUserId(req.params.id);
  console.log('Pesquisa por id: '+req.params.id);
  return res.status(200).json(results);
});

app.post('/update/', validarJWT, async (req, res) => {
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

app.post('/create', validarJWT, async (req, res) => {
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


app.post('/delete/', validarJWT, async (req, res) => {
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