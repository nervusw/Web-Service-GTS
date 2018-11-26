exports.database =
{
    host: "127.0.0.1",
    user: "root",
    password: "root",
    port: 3306,
    database: "root",
    timeout: 1,
    charset: 'utf8mb4'
};
exports.routes =
{
    "default": "default",
    "error": "error"
};
exports.application =
{
    "base_url":"http://127.0.0.1:8080/",
    "environment":"development"//production -- testing -- development
};
exports.autoload =
[
    "controllers",
    "model"
];