const axios = require('axios');

// 서버 메모리 캐시 설정
let cache = {};
let cacheExpiration = 0; // 캐시 만료 타임스탬프

// 캐시 만료 시간 계산 (36분 주기)
function getNextCacheExpiration() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const refreshIntervals = Array.from({ length: 40 }, (_, i) => i * 36);
  const nextRefresh = refreshIntervals.find(interval => interval > currentMinutes) || 1440;

  const expirationTime = new Date(now);
  expirationTime.setHours(0, nextRefresh, 0, 0);
  return expirationTime.getTime();
}

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://shuujumoney.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// 서버리스 함수
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end(); // Preflight 응답
  }

  setCorsHeaders(res);

  const { npc, server, channel } = req.query;
  const cacheKey = `${npc}:${server}:${channel}`;
  const now = Date.now();

  // 캐시 유효성 검사
  if (cache[cacheKey] && now < cacheExpiration) {
    console.log(`캐시 사용: ${cacheKey}`);
    return res.status(200).json({ data: cache[cacheKey], source: 'cache' });
  }

  try {
    const API_KEY = process.env.API_KEY; // Vercel 환경 변수에서 API 키 가져오기
    const url = `https://open.api.nexon.com/mabinogi/v1/npcshop/list?npc_name=${npc}&server_name=${server}&channel=${channel}`;

    console.time(`API 호출 시간: ${cacheKey}`);
    const response = await axios.get(url, {
      headers: { 'x-nxopen-api-key': API_KEY },
    });
    console.timeEnd(`API 호출 시간: ${cacheKey}`);

    if (!response.data.shop) {
      const errorMessage = response.data.error.message || 'NPC 데이터를 찾을 수 없습니다.';
      console.error(`에러 발생: ${errorMessage}`);
      return res.status(404).json({
        name: response.data.error?.name || 'NotFoundError',
        message: errorMessage,
        status: 404,
      });
    }

    // API 응답을 캐시에 저장
    cache[cacheKey] = response.data;
    cacheExpiration = getNextCacheExpiration(); // 다음 만료 시간 설정

    console.log(`API 데이터 저장: ${cacheKey}`);
    return res.status(200).json({ data: response.data, source: 'api' });
  } catch (error) {
    // 에러 로그 출력
    console.error(`API 호출 실패: ${error.message}`);

    const errorResponse = {
      name: error.name || 'APIError',
      message: error.response?.data?.message || error.message || '알 수 없는 오류',
      status: error.response?.status || 500,
    };

    // 에러 응답 전송
    return res.status(errorResponse.status).json(errorResponse);
  }
};
