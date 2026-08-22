(function (root) {
  const E = root.CC_ENGINE;
  const D = root.CC_DATA;

  function readShares(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 80;
        canvas.height = 80;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 80, 80);
        const out = E.classifyPixels(ctx.getImageData(0, 0, 80, 80).data);
        URL.revokeObjectURL(url);
        resolve(out);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function thumb(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 720;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async function analyzeMeal(imageFile, options) {
    const opts = options || {};
    const classified = imageFile ? await readShares(imageFile) : { shares: {} };
    const preview = imageFile ? await thumb(imageFile) : "";
    const raw = E.analyzeMeal({
      shares: classified.shares,
      plateId: opts.plateId || "9",
      hour: opts.hour == null ? new Date().getHours() : opts.hour,
      historyNames: opts.historyNames || []
    });
    const items = raw.items.map((item) => {
      const food = D.FOODS.find((f) => f.id === item.id) || D.FOODS[0];
      const grams = Math.round((food.grams || 120) * (item.portion || 1));
      return Object.assign(E.scaleByGrams(food, grams), { approx: true });
    });
    const label = items[0] ? items.map((i) => i.name).slice(0, 3).join(" + ") : "Mixed plate";
    return {
      title: label,
      image: preview,
      items,
      totals: E.sumMacros(items),
      confidence: raw.confidence >= 0.8 ? "High" : raw.confidence >= 0.68 ? "Moderate" : "Low",
      confidenceScore: raw.confidence,
      note: "Estimated calories and approximate portions. Confirm before saving — this is not a medical measurement."
    };
  }

  root.CC_AI = { analyzeMeal, thumb };
  if (typeof module !== "undefined" && module.exports) module.exports = root.CC_AI;
})(typeof globalThis !== "undefined" ? globalThis : this);
