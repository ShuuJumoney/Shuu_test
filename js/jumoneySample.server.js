//const BASE_URL = "https://shuujumoney.github.io/jumoney/image/jumoney/open"; //테스트용
const BASE_URL = "./image_data.php"; 
//const BASE_URL = "./image/jumoney/open"; //배포용
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
 
/**
 * 주머니의 이미지 메타데이터를 가져옵니다.
 */
async function getImageData(pouchName) {
    const url = `${BASE_URL}?pouch=${encodeURIComponent(pouchName)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`메타데이터 로드 실패: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`메타데이터 가져오기 실패: ${error.message}`);
        return null;
    }
}

/**
 * 이미지 로드 함수 (캐시 활용)
 */
function loadImage(pouchName, key) {
    const src = `${BASE_URL}?pouch=${encodeURIComponent(pouchName)}&key=${encodeURIComponent(key)}`;
    if (defaultImageCache.has(src)) return Promise.resolve(defaultImageCache.get(src));

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "anonymous";
        img.onload = () => {
            defaultImageCache.set(src, img);
            resolve(img);
        };
        img.onerror = () => reject(new Error(`이미지 로드 실패: ${src}`));
    });
}

/**
 * 주머니 이미지를 합성하여 반환합니다.
 */
async function createJumoneyImage(itemName, colors, backgroundColor) {
    const item = await getImageData(itemName);
    if (!item) throw new Error('아이템을 찾을 수 없습니다!');

    const [colorA, colorB, colorC] = colors.map(parseColor);
    const [imgA, imgB, imgC, imgM1, imgM2] = await Promise.all([
        loadImage(itemName, 'A'),
        loadImage(itemName, 'B'),
        loadImage(itemName, 'C'),
        loadImage(itemName, 'M1'),
        loadImage(itemName, 'M2')
    ]);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true });

    canvas.width = Math.max(imgA?.width || 0, imgB?.width || 0, imgC?.width || 0);
    canvas.height = Math.max(imgA?.height || 0, imgB?.height || 0, imgC?.height || 0);

    if (imgA) ctx.drawImage(await applyNewColor(imgA, colorA, canvas, ctx), 0, 0);
    if (imgB) ctx.drawImage(await applyNewColor(imgB, colorB, canvas, ctx), 0, 0);
    if (imgC) ctx.drawImage(await applyNewColor(imgC, colorC, canvas, ctx), 0, 0);
    if (imgM1) ctx.drawImage(imgM1, 0, 0);
    if (imgM2) ctx.drawImage(imgM2, 0, 0);

    if (backgroundColor) setBackgroundColor(ctx, backgroundColor, canvas);

    return canvas.toDataURL('image/png');
}

/**
 * 색상 파싱 및 변환 함수
 */
function parseColor(input) {
    if (input.startsWith('#')) {
        const bigint = parseInt(input.slice(1), 16);
        return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    }
    const [r, g, b] = input.match(/\d+/g).map(Number);
    return { r, g, b };
}

/**
 * 색상을 변경하여 새로운 이미지 생성
 */
async function applyNewColor(image, targetColor, canvas, ctx) {
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(targetColor.r + data[i] - 128);
        data[i + 1] = clamp(targetColor.g + data[i + 1] - 128);
        data[i + 2] = clamp(targetColor.b + data[i + 2] - 128);
    }
    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
        const newImg = new Image();
        newImg.src = canvas.toDataURL();
        newImg.onload = () => resolve(newImg);
    });
}

/**
 * 값 제한 함수 (0~255)
 */
function clamp(value) {
    return Math.max(0, Math.min(255, value));
}

/**
 * 배경색 설정 함수
 */
function setBackgroundColor(ctx, color, canvas) {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}