import crypto from 'crypto';

// 生成hash签名的函数
export function getHash(params: Record<string, any>, appSecret: string): string {
  const sortedParams = Object.keys(params)
    .filter(key => params[key] && key !== 'hash')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const stringSignTemp = sortedParams + appSecret;
  return crypto.createHash('md5').update(stringSignTemp).digest('hex');
}

// 生成随机字符串
export function generateNonceStr(): string {
  return Date.now().toString(16).slice(0, 6) + '-' + Math.random().toString(16).slice(2, 8);
}

// 获取当前时间戳
export function getNowDate(): number {
  return Math.floor(new Date().valueOf() / 1000);
}

// 生成唯一订单号
export function generateOrderId(): string {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

// 调用虎皮椒支付API
export async function callXunhuPayAPI(params: Record<string, any>) {
  const requestParams = new URLSearchParams(params as any);

  const response = await fetch('https://api.xunhupay.com/payment/do.html', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestParams.toString(),
  });

  return await response.json();
}
