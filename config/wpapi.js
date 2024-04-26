// 引入数据库连接配置
var models = require('./db');
// 引入express包
var express = require('express');
const app = express()
//创建路由器对象
var router = express.Router();
// 引入mysql包
var mysql = require('mysql');
const multer = require('multer');
var path = require('path')
const fs = require('fs');
// 连接数据库
var conn = mysql.createConnection(models.mysql);
conn.connect();
// 设置返回response
var jsonWrite = function (res, ret) {
    if (typeof ret === 'undefined') {
        res.json({
            code: '1',
            msg: '操作失败'
        });
    } else {
        console.log('ret11', ret)
        res.json(ret);
    }
};
// 下面是api路由的代码
//查询全部
router.post('/loadproduct', (req, res) => {
    let sizebigin = (req.body.page - 1) * req.body.size + 5
    conn.query(`select * from producttable LIMIT ${req.body.size} OFFSET ${sizebigin}`,
        function (err, result) {
            if (!result) {
                jsonWrite(res, {
                    code: 4001,
                    info: "未查询到商品信息"
                })
            } else {
                jsonWrite(res, {
                    code: 2001,
                    info: "查询成功",
                    productData: result
                });

            }
            if (err) {
                console.log(err);
            }
        })
})



let objMulter = multer({ dest: "./public/upload" });
//实例化multer，传递的参数对象，dest表示上传文件的存储路径
router.use(objMulter.any())//any表示任意类型的文件
// app.use(objMulter.image())//仅允许上传图片类型
router.use(express.static("./public"))

// const upload = multer({ storage: storage })
router.post("/upload", (req, res) => {
    let oldName = req.files[0].path;//获取名字
    //给新名字加上原来的后缀
    let newName = req.files[0].path + path.parse(req.files[0].originalname).ext;
    fs.renameSync(oldName, newName);//改图片的名字
    res.send({
        code: 200,
        url:
            "http://localhost:3007/api/upload/" +
            req.files[0].filename +
            path.parse(req.files[0].originalname).ext//该图片的预览路径
    });
})


// 导出路由对象
module.exports = router;
