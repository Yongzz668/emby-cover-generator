// 需要先安装 @napi-rs/canvas 依赖
import { createCanvas } from '@napi-rs/canvas';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 处理OPTIONS请求 (CORS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }
    
    // 处理生成请求
    if (url.pathname === '/generate' && request.method === 'POST') {
      try {
        // 添加CORS头
        const headers = {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="emby-cover.png"',
          'Access-Control-Allow-Origin': '*'
        };
        
        const params = await request.json();
        
        // 验证参数
        if (!params.embyUrl || !params.apiKey) {
          return new Response(JSON.stringify({ error: '缺少必要参数' }), {
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' }
          });
        }
        
        // 生成封面图片
        const coverImage = await generateCoverImage(params);
        
        return new Response(coverImage, { headers });
        
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }
    
    // 默认返回前端页面
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <title>Emby Cover Generator</title>
        <style>body { font-family: Arial; text-align: center; padding: 50px; }</style>
      </head>
      <body>
        <h1>Emby Cover Generator Worker</h1>
        <p>This is the backend worker for the Emby Cover Generator.</p>
        <p>Please use the frontend interface to generate covers.</p>
      </body>
    </html>`;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// 封面生成函数
async function generateCoverImage(params) {
  // 创建画布
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 添加标题
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.fillText('Emby 最新推荐', 50, 100);
  
  // 添加参数信息
  ctx.font = '20px Arial';
  ctx.fillText(`时间范围: ${params.timeRange}`, 50, 150);
  ctx.fillText(`生成规则: ${params.rule}`, 50, 180);
  ctx.fillText(`使用字体: ${params.font}`, 50, 210);
  
  // 添加当前日期
  const now = new Date();
  ctx.fillText(`生成时间: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 50, 240);
  
  // 添加水印
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.font = 'bold 60px Arial';
  ctx.fillText('EMBY', 200, 400);
  
  // 返回PNG Buffer
  return canvas.toBuffer('image/png');
}