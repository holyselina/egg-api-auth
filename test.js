/* // 签名工具
const {signParams} = require('egg-api-auth')

//Http请求客户端,可以自行选择自己喜欢用的客户端模块
const axios = require('axios')

//分配的你客户端ID
const clientID = 'caibianyun'

//分配你的密钥
const accessKey = 'c7693a91b7c35fd8c77c'

//调用地址
const url = 'http://update-gather-test.ksbao.com'

//程序入口
function go() {
  //业务参数
  const params = {

  };
  signParams(params,accessKey)
  console.log(params)
  axios.post(url,params).then((response)=>{
    console.log(response.data)
  }).catch((error) => {
    console.log(error.response.data);
  })
}
*/
const t = {
  2102: 123,
};
console.log(t[2102]);
