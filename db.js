if (!process.env.dbURL) {
    require('./env.js');
}

module.exports = {
    'url': process.env.dbURL
};