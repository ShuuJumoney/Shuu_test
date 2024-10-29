const axios = require('axios');
const Redis = require('ioredis'); // Redis 사용

// Redis 인스턴스 생성 (Upstash Redis URL 사용)
const redis = new Redis(process.env.REDIS_URL);

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://shuujumoney.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// 다음 캐시 만료 시간 계산
function getNextCacheExpiration() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const refreshIntervals = Array.from({ length: 40 }, (_, i) => i * 36);
  const nextRefresh = refreshIntervals.find(interval => interval > currentMinutes) || 1440;

  const expirationTime = new Date(now);
  expirationTime.setHours(0, nextRefresh, 0, 0);
  return expirationTime.getTime();
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  setCorsHeaders(res);

  const { npc, server, channel } = req.query;
  const cacheKey = `${npc}:${server}:${channel}`;

  try {
    // Redis에서 캐시 조회
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Redis 캐시 사용: ${cacheKey}`);
      return res.status(200).json({ data: JSON.parse(cachedData), source: 'cache' });
    }

    // API 호출
    const API_KEY = process.env.API_KEY;
    const url = `https://open.api.nexon.com/mabinogi/v1/npcshop/list?npc_name=${npc}&server_name=${server}&channel=${channel}`;

    console.time(`API 호출 시간: ${cacheKey}`);
    const response = await axios.get(url, {
      headers: { 'x-nxopen-api-key': API_KEY },
    });
    console.timeEnd(`API 호출 시간: ${cacheKey}`);

    if (!response.data.shop) {
      const errorMessage = response.data.error?.message || 'NPC 데이터를 찾을 수 없습니다.';
      console.error(`에러 발생: ${errorMessage}`);
      return res.status(404).json({
        name: response.data.error.name || 'NotFoundError',
        message: errorMessage,
        status: 404,
      });
    }

    // 전체 데이터를 캐시하고 반환
    const items = response.data;

    // Redis에 캐시 저장 (TTL 36분)
    await redis.set(cacheKey, JSON.stringify(items), 'EX', 36 * 60);

    console.log(`API 데이터 저장: ${cacheKey}`);
    return res.status(200).json({ data: items, source: 'api' });
  } catch (error) {
    console.error(`API 호출 실패: ${error.message}`);
    const errorResponse = {
      name: error.name || 'APIError',
      message: error.response?.data?.message || error.message || '알 수 없는 오류',
      status: error.response?.status || 500,
    };
    return res.status(errorResponse.status).json(errorResponse);
  }
};
