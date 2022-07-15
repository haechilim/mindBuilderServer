const mysql = require('mysql');

class DatabaseManager {
    constructor() {
        this.lastId = 0;

        setInterval(() => this.test(), 10800000);
    }

    connect() {
        this.connection = mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'gocl213@',
            database: 'mindBuilder'
        });
        this.connection.connect();
    }

    disconnect() {
        this.connection.end();
    }

    init() {
        this.query('SELECT LAST_INSERT_ID() from postModel limit 1', (error, result) => this.lastId = result);
    }

    userAdd(name, email, callback) {
        this.query('INSERT INTO user(name, email) VALUES("' + name + '", "' + email + '");', callback);
    }

    userRead(id, callback) {
        this.query('SELECT * FROM user WHERE id = ' + id + ';', callback);
    }

    userDelete(id, callback) {
        this.query('DELETE FROM user WHERE id = ' + id + ';', callback);
    }

    postModelAdd(title, userId, contentsModel, explain, link, callback) {
        this.query('INSERT INTO postModel(title, userId, explain_, link) VALUES("' + title + '", ' + userId + ', "' + explain + '", "' + link + '");', (error) => {
            for(let i = 0; i < contentsModel.length; i++) {
                let json = contentsModel[i];
                this.query('INSERT INTO contentsModel(postId, title, type, link, linkImage) VALUES(' + this.lastId + ', "' + json.title + '", ' + json.type + ', "' + json.link + '", "' + json.linkImage + '");', (error) => console.log(error));
            }
            callback;
        });
        
        console.log(contentsModel);
    }

    query(query, callback) {
        this.connection.query(query, callback);
    }
}

module.exports = DatabaseManager;