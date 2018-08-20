# egg-api-auth

签名规则如下:
  1.我们会颁发给调用者一个clientID和accessKey,也就是调用者ID和秘钥.
  2.每个接口除了业务参数外需要传递公共参数cilentID和timestamp以及nonce,
    timestamp为当前时间戳,格式为整数:new Date().getTime(),nonce为随机数,随机数是为了防止重放攻击
  3.请求接口时候,将所有请求参数(包括公共参数)集合按照参数名ASCII码从小到大排序,
    然后使用URL键值对的格式(即key1=value1&key2=value2…)拼接成字符串<stringA>.
  4.在<stringA>字符串的最后拼接上<accessKey>(也就是颁发给调用者的秘钥)得到<stringSignTemp>字符串,并对<stringSignTemp>进行MD5运算,
  再将得到的MD5字符串所有字符转换为大写,得到签名的值<signValue>.
  5.将签名的值<signValue>以参数名称sign附加在请求参数中.
 