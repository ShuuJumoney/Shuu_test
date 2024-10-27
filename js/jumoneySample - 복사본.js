async function applyNewColor(image, newColor) {
  if (!image) return;

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const rOffset = data[i] - 128;
    const gOffset = data[i + 1] - 128;
    const bOffset = data[i + 2] - 128;

    data[i] = clamp(newColor.r + rOffset);
    data[i + 1] = clamp(newColor.g + gOffset);
    data[i + 2] = clamp(newColor.b + bOffset);
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    img.onload = () => resolve(img);
  });
}

applyOverlayButton.addEventListener('click', async () => {
  const selectedItem = itemSelect.value;
  const item = open_jumoney[selectedItem];
  if (!item) {
    alert('아이템을 선택하세요!');
    return;
  }

  const newColorA = parseColor(document.getElementById('colorA').value);
  const newColorB = parseColor(document.getElementById('colorB').value);
  const newColorC = parseColor(document.getElementById('colorC').value);
  const backgroundColor = document.getElementById('backgroundColor').value;

  try {
    const [imgA, imgB, imgC, imgM1, imgM2] = await Promise.all([
      loadImage(item.A),
      loadImage(item.B),
      loadImage(item.C),
      loadImage(item.M1),
      loadImage(item.M2)
    ]);

    const maxWidth = Math.max(imgA?.width || 0, imgB?.width || 0, imgC?.width || 0);
    const maxHeight = Math.max(imgA?.height || 0, imgB?.height || 0, imgC?.height || 0);
    canvas.width = maxWidth;
    canvas.height = maxHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const newImgA = imgA ? await applyNewColor(imgA, newColorA) : null;
    const newImgB = imgB ? await applyNewColor(imgB, newColorB) : null;
    const newImgC = imgC ? await applyNewColor(imgC, newColorC) : null;

    if (newImgA) ctx.drawImage(newImgA, 0, 0);
    if (newImgB) ctx.drawImage(newImgB, 0, 0);
    if (newImgC) ctx.drawImage(newImgC, 0, 0);

    if (imgM1) ctx.drawImage(imgM1, 0, 0);
    if (imgM2) ctx.drawImage(imgM2, 0, 0);

    if (backgroundColor !== 'transparent') {
      setBackgroundColor(backgroundColor);
    }

    resultImage.src = canvas.toDataURL('image/png');
  } catch (error) {
    console.error(error);
    alert('이미지 처리 중 오류가 발생했습니다.');
  }
});

function setBackgroundColor(color) {
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
