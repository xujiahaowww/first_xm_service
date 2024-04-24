let express = require('express') // 引入express
let app = express() // 相当于 http.createServer(app)
const cors = require('cors')
let bodyParser = require('body-parser')
//----- 配置跨域 -----

app.use(cors())
// express框架解决跨域问题的代码，注意该代码要放在 app.use(router); 之前
app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", "Express");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.use(bodyParser.json());

app.use('/api', require('./config/api'))
// 监听3000端口
app.listen(3007, () => {
    console.log(`Server running at 3007`)
})
