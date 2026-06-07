/**
 * Hàm tạo ra một canvas từ hình ảnh đã crop
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous'); // Quan trọng nếu bạn load hình từ một domain khác
      image.src = url;
    });
  
  /**
   * Lấy kích thước canvas cho hình ảnh xoay
   */
  function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180;
  }
  
  /**
   * Trả về kích thước của hình ảnh sau khi tính toán xoay
   */
  function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation);
  
    return {
      width:
        Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  }
  
  /**
   * Hàm chính để crop hình ảnh
   */
  export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: any,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
  ): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    if (!ctx) {
      return imageSrc;
    }
  
    const rotRad = getRadianAngle(rotation);
  
    // Tính toán bounding box mới của hình ảnh sau khi xoay
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    );
  
    // Đặt kích thước canvas để bao phủ hình ảnh xoay
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;
  
    // Vẽ hình ảnh xoay vào canvas
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);
  
    // Trích xuất vùng đã crop
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
  
    if (!croppedCtx) {
      return imageSrc;
    }
  
    // Đặt kích thước cho canvas hình ảnh đã crop
    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;
  
    // Vẽ vùng đã crop vào canvas mới
    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  
    // Tạo một canvas tròn cho hình ảnh hình tròn
    const roundedCanvas = document.createElement('canvas');
    const roundedCtx = roundedCanvas.getContext('2d');
  
    if (!roundedCtx) {
      return croppedCanvas.toDataURL();
    }
  
    // Đặt kích thước cho canvas tròn
    const size = Math.min(pixelCrop.width, pixelCrop.height);
    roundedCanvas.width = size;
    roundedCanvas.height = size;
  
    // Vẽ hình tròn
    roundedCtx.beginPath();
    roundedCtx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    roundedCtx.closePath();
    roundedCtx.clip();
  
    // Vẽ hình ảnh đã crop vào hình tròn
    roundedCtx.drawImage(
      croppedCanvas,
      (size - pixelCrop.width) / 2,
      (size - pixelCrop.height) / 2
    );
  
    // Trả về hình ảnh dạng base64
    return roundedCanvas.toDataURL();
  }