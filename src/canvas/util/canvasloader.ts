import Canvas from "../Canvas";

export async function processWater(): Promise<number[][]> {
    const pixelplace_canvas = document.getElementById('canvas') as HTMLCanvasElement;
    var waterArray = Array.from({ length: pixelplace_canvas.width }, () => Array.from({ length: pixelplace_canvas.height }, () => 1));

    var image = await fetch('https://pixelplace.io/canvas/' + Canvas.instance.ID + 'p.png?t200000=' + Date.now());
    if (!image.ok) {
        return waterArray
    }
    const blob = await image.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d', { "willReadFrequently": true });
    context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
        if (bitmap.width == 1 && bitmap.height == 1) { // custom canvases ?
            resolve(waterArray);
        }
        for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * imageData.width + x) * 4;
            var r = imageData.data[index];
            var g = imageData.data[index + 1];
            var b = imageData.data[index + 2];
            if (r == 204 && g == 204 && b == 204) {
                waterArray[x][y] = 200;
            }
        }
        }
        console.log(waterArray);
        resolve(waterArray);
    })
}

export async function processColors() {
    const start_total_time = performance.now();
    const canvas = Canvas.instance
    const pixelplace_canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = pixelplace_canvas.getContext('2d', { "willReadFrequently": true });
    const imageData = ctx.getImageData(0, 0, pixelplace_canvas.width, pixelplace_canvas.height);
    const pixelData = imageData.data;
    const start_water_time = performance.now();
    const waterArray: number[][] = await processWater();
    const final_water_time = performance.now() - start_water_time;
    var CanvasArray = Array.from({ length: pixelplace_canvas.width }, () => Array.from({ length: pixelplace_canvas.height }, () => 1));

    const start_color_time = performance.now()
    if (waterArray.length > 1) {
        CanvasArray = waterArray;
    }
    for (let y = 0; y < pixelplace_canvas.height; y++) {
        for (let x = 0; x < pixelplace_canvas.width; x++) {
            if (CanvasArray[x][y] == 200) {
                continue;
            }
            const pixelIndex = (y * pixelplace_canvas.width + x) * 4;

            const r = pixelData[pixelIndex];
            const g = pixelData[pixelIndex + 1];
            const b = pixelData[pixelIndex + 2];
            const colorIndex = canvas.colors.findIndex(color =>
              color[0] === r && color[1] === g && color[2] === b
            );
            CanvasArray[x][y] = colorIndex;
        }
    }
    console.log(CanvasArray);
    Canvas.instance.canvasArray = CanvasArray;

    // Logging
    const final_total_time = performance.now() - start_total_time;
    const final_colors_time = performance.now() - start_color_time
    console.log(`[7p PROCESSING] Total Time: ${final_total_time}ms, Colors Time: ${final_colors_time}ms, Water Time: ${final_water_time}ms`);
    Toastify ({
        text: `Canvas loaded!`,
        style: {
            background: "#1a1a1a",
            border: "solid rgb(0, 255, 81)"
        },
    }).showToast();
}
