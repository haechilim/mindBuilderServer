const mysql = require('mysql');

class DatabaseManager {
    constructor() {
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

    userAdd(name, email, callback) {
        this.query('INSERT INTO user(name, email) VALUES("' + name + '", "' + email + '");', callback);
    }

    query(query, callback) {
        this.connection.query(query, callback);
    }
}

module.exports = DatabaseManager;