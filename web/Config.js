/**
 * Created by reason on 16/10/21.
 */

    /**
     * 测试环境:0
     * 预生产环境:1
     * 生产环境:2
     */
    var ENV = 1;

    var config = {ip:'0.0.0.0',port:3001,
        server:'http://0.0.0.0:3003',
        life:'http://121.199.28.174:8080/records/',
        dev:'development'
    };


    // //集成测试环境
    // config = {ip:'0.0.0.0',port:3001,
    //     server:'http://115.29.5.64:3003',
    //     life:'http://115.29.8.49/records/',
    //     dev:'development'
    // };
    //
    //正式环境
    config = {ip:'0.0.0.0',port:5000,
    server:'http://121.199.29.6:3003',
    life:'http://121.199.28.174:8080/records/',
    dev:'development'
    };

    // if(ENV == 1){
    //     config.ip = '120.27.162.228';
    //     config.port = 3006;
    //     config.server = 'http://120.27.162.228:3003';
    //     config.dev = 'development';
    //
    // }else if(ENV == 2){
    //     config.ip = '120.27.162.228';
    //     config.port = 3005;
    //     config.server = 'http://120.27.162.228:3002';
    //     config.dev = 'production';
    // }

// var Config = {
//     version:'0.0.2',
//     ip:'120.27.162.228',
//     port:3005,
//     appServer: 'http://120.27.162.228:3002'
// };

var Config = {
    version:'0.0.2',
    ip:config.ip,
    port:config.port,
    appServer: config.server,
    lifeServer:config.life
};

module.exports = Config;