import dns from 'dns';

console.log('正在解析 smtp.163.com 的 IP 地址...\n');

// 使用国内 DNS 服务器
dns.setServers(['114.114.114.114', '223.5.5.5', '8.8.8.8']);

dns.resolve4('smtp.163.com', (err, addresses) => {
  if (err) {
    console.error('❌ DNS 解析失败:', err.message);
    console.error('\n如果解析失败，可以尝试：');
    console.error('1. 在命令行运行: nslookup smtp.163.com');
    console.error('2. 在命令行运行: ping smtp.163.com');
    process.exit(1);
  }

  console.log('✅ smtp.163.com 解析到以下 IP 地址:\n');
  addresses.forEach((ip, index) => {
    console.log(`  ${index + 1}. ${ip}`);
  });

  console.log('\n推荐配置:');
  console.log(`  SMTP_HOST=${addresses[0]}`);
  console.log('\n将上面的配置添加到你的 .env.local 或生产环境的环境变量中');
});
