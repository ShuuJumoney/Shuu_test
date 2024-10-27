//const BASE_URL = "https://shuujumoney.github.io/jumoney/image/jumoney/open";
const BASE_URL = "/image/jumoney/open";
const defaultImageCache = new Map(); // 이미지 캐시 저장소
const open_jumoney = {
	"튼튼한 달걀 주머니": { A: "open_crops_base.png", B: "", C: "", M1: "open_egg.png", M2: "open_plus_top.png" },
	"튼튼한 감자 주머니": { A: "open_crops_base.png", B: "", C: "", M1: "open_potato.png", M2: "open_plus_top.png" },
	"튼튼한 옥수수 주머니": { A: "open_crops_base.png", B: "", C: "", M1: "open_corn.png", M2: "open_plus_top.png" },
	"튼튼한 밀 주머니": { A: "open_crops_base.png", B: "", C: "", M1: "open_wheat.png", M2: "open_plus_top.png" },
	"튼튼한 보리 주머니": { A: "open_crops_base.png", B: "", C: "", M1: "open_barley.png", M2: "open_plus_top.png" },
	"튼튼한 양털 주머니": { A: "open_fleece_base.png", B: "open_fleece_main.png", C: "", M1: "open_fleece_plus.png" },
	"튼튼한 거미줄 주머니": { A: "open_cobweb_base.png", B: "open_cobweb_icon.png", C: "open_cobweb_main.png", M1: "open_plus_top.png" },
	"튼튼한 가는 실뭉치 주머니": { A: "open_thin_base.png", B: "open_thin_icon.png", C: "open_thin_main.png", M1: "open_plus_top.png" },
	"튼튼한 굵은 실뭉치 주머니": { A: "open_thick_thread_base.png", B: "open_thick_icon.png", C: "open_thick_main.png", M1: "open_plus_top.png" },
	"튼튼한 저가형 가죽 주머니": { A: "open_leather_base_1.png", B: "open_leather_main.png", C: "open_leather_number_1.png", M1: "open_plus_bottom.png" },
	"튼튼한 일반 가죽 주머니": { A: "open_leather_base_2.png", B: "open_leather_main.png", C: "open_leather_number_2.png", M1: "open_plus_top.png" },
	"튼튼한 고급 가죽 주머니": { A: "open_leather_base_3.png", B: "open_leather_main.png", C: "open_leather_number_3.png", M1: "open_plus_top.png" },
	"튼튼한 최고급 가죽 주머니": { A: "open_leather_base_2,3,4.png", B: "open_leather_main.png", C: "open_leather_number_4.png", M1: "open_plus_top.png" },
	"튼튼한 저가형 옷감 주머니": { A: "open_fabric_base_all.png", B: "fabric_main.png", C: "open_fabric_number_1.png", M1: "open_plus_bottom.png" },
	"튼튼한 일반 옷감 주머니": { A: "open_fabric_base_all.png", B: "fabric_main.png", C: "open_fabric_number_2.png", M1: "open_plus_bottom.png" },
	"튼튼한 고급 옷감 주머니": { A: "open_fabric_base_all.png", B: "fabric_main.png", C: "open_fabric_number_3.png", M1: "open_plus_bottom.png" },
	"튼튼한 최고급 옷감 주머니": { A: "open_fabric_base_all.png", B: "fabric_main.png", C: "open_fabric_number_4.png", M1: "open_plus_bottom.png" },
	"튼튼한 저가형 실크 주머니": { A: "open_silk_base_1,2.png", B: "silk_main.png", C: "open_silk_number_1.png", M1: "open_plus_top.png" },
	"튼튼한 일반 실크 주머니": { A: "open_silk_base_1.png", B: "silk_main.png", C: "open_silk_number_2.png", M1: "open_plus_top.png" },
	"튼튼한 고급 실크 주머니": { A: "open_silk_base_3,4.png", B: "silk_main.png", C: "open_silk_number_3.png", M1: "open_plus_bottom.png" },
	"튼튼한 최고급 실크 주머니": { A: "open_silk_base_3,4.png", B: "silk_main.png", C: "open_silk_number_4.png", M1: "open_plus_bottom.png" },
	"튼튼한 꽃바구니": { A: "open_flower_base.png", B: "open_flower_color2.png", C: "open_flower_main.png", M1: "open_plus_top.png", M2: "open_flower_leaf.png" },
}
/**
 * 이미지 합성 함수
 * @param {string} itemName - 아이템 이름
 * @param {Array<string>} colors - [A, B, C] 색상 배열 (Hex 또는 RGB)
 * @param {string} backgroundColor - 배경색 (transparent, white, black)
 * @returns {Promise<string>} - 합성된 이미지의 Data URL 반환
 */
async function createJumoneyImage(itemName, colors, backgroundColor) {
  const item = open_jumoney[itemName];
  if (!item) throw new Error('아이템을 찾을 수 없습니다!');

  const [colorA, colorB, colorC] = colors.map(parseColor);

  const [imgA, imgB, imgC, imgM1, imgM2] = await Promise.all([
    loadImage(item.A),
    loadImage(item.B),
    loadImage(item.C),
    loadImage(item.M1),
    loadImage(item.M2)
  ]);

  const maxWidth = Math.max(imgA?.width || 0, imgB?.width || 0, imgC?.width || 0);
  const maxHeight = Math.max(imgA?.height || 0, imgB?.height || 0, imgC?.height || 0);

  const canvas = document.createElement('canvas'); // 가상 캔버스 생성
  const ctx = canvas.getContext('2d', { alpha: true });

  canvas.width = maxWidth;
  canvas.height = maxHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const newImgA = imgA ? await applyNewColor(imgA, colorA, canvas, ctx) : null;
  const newImgB = imgB ? await applyNewColor(imgB, colorB, canvas, ctx) : null;
  const newImgC = imgC ? await applyNewColor(imgC, colorC, canvas, ctx) : null;

  if (newImgA) ctx.drawImage(newImgA, 0, 0);
  if (newImgB) ctx.drawImage(newImgB, 0, 0);
  if (newImgC) ctx.drawImage(newImgC, 0, 0);

  if (imgM1) ctx.drawImage(imgM1, 0, 0);
  if (imgM2) ctx.drawImage(imgM2, 0, 0);

   // 배경색이 있는 경우에만 설정
  if (backgroundColor) {
    setBackgroundColor(ctx, backgroundColor, canvas);
  }

  return canvas.toDataURL('image/png');
}

/**
 * 이미지 로드 함수
 * @param {string} src - 이미지 경로
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
	if (defaultImageCache.has(src)) {
		// 캐시에 있는 이미지 반환
		return Promise.resolve(defaultImageCache.get(src));
	}
	return new Promise((resolve, reject) => {
		if (!src) return resolve(null);
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.src = `${BASE_URL}/${src}`;		
		img.onload = () => {defaultImageCache.set(src, img); resolve(img)};
		img.onerror = () => reject(new Error(`이미지 로드 실패: ${src}`));
	});
}

/**
 * 색상 변경 함수
 * @param {HTMLImageElement} image - 원본 이미지
 * @param {object} newColor - 새 색상 객체 { r, g, b }
 * @param {HTMLCanvasElement} canvas - 가상 캔버스
 * @param {CanvasRenderingContext2D} ctx - 캔버스 렌더링 컨텍스트
 * @returns {Promise<HTMLImageElement>} - 색상 변경된 이미지 반환
 */
async function applyNewColor(image, targetColor, canvas, ctx) {
  ctx.drawImage(image, 0, 0);
  
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  // 원본 기준 색상 (128, 128, 128)
  const baseColor = { r: 128, g: 128, b: 128 };

  for (let i = 0; i < data.length; i += 4) {
	const rOffset = data[i] - 128;
    const gOffset = data[i + 1] - 128;
    const bOffset = data[i + 2] - 128;

    data[i] = clamp(targetColor.r + rOffset);
    data[i + 1] = clamp(targetColor.g + gOffset);
    data[i + 2] = clamp(targetColor.b + bOffset);  
  }

  ctx.putImageData(imageData, 0, 0);
  // 변경된 이미지를 반환
  return new Promise((resolve) => {
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    img.onload = () => resolve(img);
  });
}

/**
 * 색상 파싱 함수 (RGB 또는 Hex)
 * @param {string} input - 색상 문자열
 * @returns {object} - 색상 객체 { r, g, b }
 */
function parseColor(input) {
  if (input.startsWith('#')) {
    const bigint = parseInt(input.slice(1), 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  } else if (input.startsWith('rgb')) {
    const [r, g, b] = input.match(/\d+/g).map(Number);
    return { r, g, b };
  } else {
    const [r, g, b] = input.split(' ').map(Number);
    return { r, g, b };
  }
}

/**
 * 값 제한 함수 (0 ~ 255)
 * @param {number} value - 값
 * @returns {number} - 제한된 값
 */
function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

/**
 * 배경색 설정 함수
 * @param {CanvasRenderingContext2D} ctx - 캔버스 렌더링 컨텍스트
 * @param {string} color - 배경색
 * @param {HTMLCanvasElement} canvas - 캔버스
 */
 
function setBackgroundColor(ctx, color, canvas) {
  ctx.globalCompositeOperation = 'destination-over'; // 배경을 밑에 깔기

  if (color) {
    // 배경색이 주어진 경우에만 채우기
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
}