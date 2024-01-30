const connection = require('./connection');

const allUsers = async () => {
    const [query] = await connection.execute('SELECT * FROM apiJavascript.authors');
    return query;
    // return {'nome': 'Camila', 'idade': 36};
};

const pesUserId = async (id) => {
    const [query] = await connection.query('SELECT * FROM apiJavascript.authors WHERE id=?', [id]);
    return query;
}

const pesUserName = async (name) => {
    const [query] = await connection.query('SELECT * FROM apiJavascript.authors WHERE name LIKE ?', ['%'+name+'%']);
    return query;
}

const create = async (name, city) => {
    const [query] = await connection.query('INSERT INTO apiJavascript.authors (name, city) VALUES (?, ?)', [name, city]);
    return query;
}

const updateUser = async (id, name, city) => {
    const [query] = await connection.query('UPDATE apiJavascript.authors SET name=?, city=? WHERE id=?', [name, city, id]);
    let ok = '';
    if(query.affectedRows>0){
        ok='Alterado com sucesso';
    }else{
        ok='Erro ao tentar alterar';
    }
    console.log(ok);
    // return query;
    return {'status': ok};
}

const deleteUser = async (id) => {
    const [query] = await connection.query('DELETE FROM apiJavascript.authors WHERE id=?', [id]);
    let ok = '';
    if(query.affectedRows>0){
        ok='Excluído com sucesso';
    }else{
        ok='Erro ao tentar exluir';
    }
    console.log(ok);
    // return query;
    return {'status': ok};
}

const login = async (email, pass) => {
    const [query] = await connection.query('SELECT * FROM apiJavascript.login WHERE email=? AND password=?', [email, pass]);
    // console.log(query);
    return (query);
}

module.exports = {allUsers, pesUserId, create, pesUserName, updateUser, deleteUser, login};