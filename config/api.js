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
var svgCaptcha = require('svg-captcha')
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
//验证码
router.get('/verif', (req, res) => {
    // res.type('svg'); // 响应的类型
    var captcha = svgCaptcha.create({
        size: 4,
        fontSize: 50,
        width: 100,
        height: 43,
        bacground: '#cc9966',
    });
    res.send(captcha);
});
//登录
router.post('/login', (req, res) => {
    conn.query(`select * from userinfo where phoneNumber='${req.body.phoneNumber}'`,
        function (err, result) {
            if (result.length === 0) {
                jsonWrite(res, {
                    code: 4003,
                    info: "该账号未注册"
                })
            } else {
                if (req.body.password === result[0].password) {
                    jsonWrite(res, {
                        code: 2001,
                        info: "登录成功",
                        userData: {
                            ...result[0]
                        }
                    });
                } else {
                    jsonWrite(res, {
                        code: 4003,
                        info: "账号密码错误"
                    })
                }
            }
            if (err) {
                console.log(err);
            }
        })
})
//注册
router.post('/registered', (req, res) => {
    conn.query(`select * from userinfo where phoneNumber=${req.body.phoneNumber}`,
        function (err, result) {
            if (result) {
                jsonWrite(res, {
                    code: 4003,
                    info: "该账号已注册"
                })
            } else {
                conn.query(`insert into userinfo(userID,name,phoneNumber,sex,password,imgsrc) values ('${req.body.userID}', '${req.body.name}', '${req.body.phoneNumber}','${req.body.sex}','${req.body.password}','${req.body.imgsrc}')`,
                    function (err, result) {
                        if (result) {
                            jsonWrite(res, {
                                code: 2001,
                                info: "账号注册成功"
                            })
                        } else {
                            jsonWrite(res, {
                                code: 4001,
                                info: "账号注册失败"
                            })
                        }
                    }
                )
            }
            if (err) {
                console.log(err);
            }
        })
})
//修改个人信息
router.post('/changeuserinfo', (req, res) => {
    conn.query(`update userinfo set phoneNumber='${req.body.phoneNumber}', password='${req.body.password}', name='${req.body.name}', sex='${req.body.sex}' where userID=${req.body.userID}`,
        function (err, result) {
            if (result) {
                jsonWrite(res, {
                    code: 2001,
                    info: "修改成功",
                });
            } else {
                jsonWrite(res, {
                    code: 4001,
                    info: "修改失败"
                })
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


async function deleteFile(url) {
    const filePath = url.split('/').slice(-1)[0];
    console.log(filePath, 'filePathfilePath')
    let res
    await fs.unlink(`./public/upload/${filePath}`,
        removeErr => {
            if (removeErr) {
                console.error(`删除文件出错: ${filePath}`, removeErr);
                res = false
            } else {
                console.log(`文件删除成功: ${filePath}`);
                res = true
            }
        })
    return res
}
//删除上传的图片
router.post('/deleUploadingimg', (req, res) => {
    console.log(req.body, 'req.bodyreq.body')
    let results = deleteFile(req.body.url)
    if (results) {
        jsonWrite(res, {
            code: 2001,
            info: "删除成功",
        })
    } else {
        jsonWrite(res, {
            code: 4001,
            info: "修改失败",
        })
    }
})
// 导出路由对象
module.exports = router;
