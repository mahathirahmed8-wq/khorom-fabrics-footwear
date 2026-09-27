import { Product, FacebookPendingPost, DuplicateMatchDetail, DuplicateMatchLevel, DetectedProductInfo } from '../types';

/**
 * Clean & normalize text for comparison
 */
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[।,\.\?!_#\-\(\)\[\]\{\}\/\\:;'"~`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize string into meaningful words (excluding common filler words)
 */
function tokenize(text: string): string[] {
  const clean = normalizeText(text);
  const stopWords = new Set([
    'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'এই', 'এবং', 'ও', 'এর', 'একটি', 'বা', 'জন্য', 'থেকে', 'পণ্য', 'কালেকশন', 'khorom', 'খড়ম'
  ]);
  return clean.split(' ').filter((w) => w.length > 1 && !stopWords.has(w));
}

/**
 * Calculate Jaccard similarity between two token arrays (0 to 1)
 */
function tokenSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  setA.forEach((t) => {
    if (setB.has(t)) intersection++;
  });
  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Check if string A contains string B or vice versa
 */
function substringOverlap(strA: string, strB: string): number {
  const a = normalizeText(strA);
  const b = normalizeText(strB);
  if (!a || !b) return 0;
  if (a === b) return 1.0;
  if (a.includes(b) && b.length > 5) return 0.85;
  if (b.includes(a) && a.length > 5) return 0.85;
  return 0;
}

/**
 * Extract price, colors, sizes and category from raw Facebook post caption
 */
export function parseFacebookCaption(
  caption: string,
  categories: { id: string; nameBn: string; nameEn: string }[] = []
): Partial<DetectedProductInfo> {
  const result: Partial<DetectedProductInfo> = {};

  if (!caption) return result;

  // 1. Detect Price (৳, Tk, BDT, দাম, etc.)
  const priceRegexes = [
    /(?:৳|tk|taka|bdt|দাম|price)\s*[:\-\.]?\s*([০-৯\d,]+)/i,
    /([০-৯\d,]+)\s*(?:৳|tk|taka|bdt|টাকা|\/\-)/i,
    /(?:মূল্য|হাতে পাবেন)\s*[:\-\.]?\s*([০-৯\d,]+)/i,
  ];

  for (const regex of priceRegexes) {
    const match = caption.match(regex);
    if (match && match[1]) {
      // Convert Bengali digits to English if present
      const rawNum = match[1]
        .replace(/০/g, '0')
        .replace(/১/g, '1')
        .replace(/২/g, '2')
        .replace(/৩/g, '3')
        .replace(/৪/g, '4')
        .replace(/৫/g, '5')
        .replace(/৬/g, '6')
        .replace(/৭/g, '7')
        .replace(/৮/g, '8')
        .replace(/৯/g, '9')
        .replace(/,/g, '')
        .trim();
      const num = parseInt(rawNum, 10);
      if (!isNaN(num) && num >= 100 && num <= 50000) {
        result.price = num;
        break;
      }
    }
  }

  // 2. Detect Category
  const lowerCap = caption.toLowerCase();
  if (lowerCap.includes('পাঞ্জাবি') || lowerCap.includes('panjabi') || lowerCap.includes('শার্ট') || lowerCap.includes('shirt') || lowerCap.includes('পোলো') || lowerCap.includes('clothing')) {
    result.category = 'clothing';
  } else if (lowerCap.includes('জুতা') || lowerCap.includes('লোফার') || lowerCap.includes('loafer') || lowerCap.includes('স্যান্ডেল') || lowerCap.includes('sandal') || lowerCap.includes('shoe') || lowerCap.includes('footwear') || lowerCap.includes('স্লিপার')) {
    result.category = 'footwear';
  } else if (lowerCap.includes('ঘড়ি') || lowerCap.includes('watch') || lowerCap.includes('সানগ্লাস') || lowerCap.includes('sunglasses') || lowerCap.includes('মানিব্যাগ') || lowerCap.includes('wallet') || lowerCap.includes('বেল্ট') || lowerCap.includes('belt') || lowerCap.includes('accessories')) {
    result.category = 'accessories';
  } else {
    result.category = 'clothing';
  }

  // 3. Detect Sizes
  const detectedSizes: string[] = [];
  if (/(?:size|সাইজ)\s*[:\-\.]?\s*([^\n\r]+)/i.test(caption)) {
    const sizeLine = caption.match(/(?:size|সাইজ)\s*[:\-\.]?\s*([^\n\r]+)/i)?.[1] || '';
    ['38', '39', '40', '41', '42', '43', '44', '45', 'S', 'M', 'L', 'XL', 'XXL'].forEach((s) => {
      if (new RegExp(`\\b${s}\\b`, 'i').test(sizeLine)) {
        detectedSizes.push(s);
      }
    });
  }
  if (detectedSizes.length === 0) {
    if (result.category === 'footwear') {
      detectedSizes.push('40', '41', '42', '43', '44');
    } else if (result.category === 'clothing') {
      detectedSizes.push('M', 'L', 'XL', 'XXL');
    }
  }
  result.sizes = detectedSizes;

  // 4. Detect Colors
  const detectedColors: { name: string; hex: string }[] = [];
  const colorMap: { [key: string]: { name: string; hex: string } } = {
    'কালো': { name: 'Black', hex: '#111827' },
    'black': { name: 'Black', hex: '#111827' },
    'সাদা': { name: 'White', hex: '#F9FAFB' },
    'white': { name: 'White', hex: '#F9FAFB' },
    'মেরুন': { name: 'Maroon', hex: '#7F1D1D' },
    'maroon': { name: 'Maroon', hex: '#7F1D1D' },
    'নেভি': { name: 'Navy Blue', hex: '#1E3A8A' },
    'navy': { name: 'Navy Blue', hex: '#1E3A8A' },
    'বাদামি': { name: 'Brown', hex: '#78350F' },
    'brown': { name: 'Brown', hex: '#78350F' },
    'অলিভ': { name: 'Olive', hex: '#3F6212' },
    'olive': { name: 'Olive', hex: '#3F6212' },
    'ট্যান': { name: 'Tan Gold', hex: '#D97706' },
    'tan': { name: 'Tan Gold', hex: '#D97706' },
  };

  Object.entries(colorMap).forEach(([keyword, colorObj]) => {
    if (lowerCap.includes(keyword)) {
      if (!detectedColors.some((c) => c.name === colorObj.name)) {
        detectedColors.push(colorObj);
      }
    }
  });

  if (detectedColors.length === 0) {
    detectedColors.push({ name: 'Midnight Black', hex: '#0f172a' });
  }
  result.colors = detectedColors;

  // 5. Detect Titles from first lines
  const lines = caption.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const rawFirstLine = lines[0].replace(/[🔥✨🌟💥🚨📢🎉]/g, '').trim();
    result.titleBn = rawFirstLine.slice(0, 70);
    result.titleEn = rawFirstLine.slice(0, 70);
  }

  return result;
}

/**
 * Compare Facebook Pending Post with Existing Products to detect duplicates.
 * Evaluates: Name, Caption, Price, Category, Color, and Image similarity.
 */
export function detectDuplicate(
  post: Partial<FacebookPendingPost>,
  existingProducts: Product[]
): DuplicateMatchDetail {
  if (!existingProducts || existingProducts.length === 0) {
    return {
      level: 'new_product',
      score: 0,
      reasons: ['Store has no products to compare.'],
    };
  }

  const postDetected = post.detectedProduct || {
    titleBn: '',
    titleEn: '',
    price: 0,
    category: '',
    colors: [],
    sizes: [],
    stockCount: 10,
    descriptionBn: '',
    descriptionEn: '',
    image: post.imageUrl || '',
    images: post.imageUrl ? [post.imageUrl] : [],
    tags: [],
  };

  const postCaption = post.caption || '';
  const postImage = post.imageUrl || postDetected.image || '';
  const postTitleBn = postDetected.titleBn || '';
  const postTitleEn = postDetected.titleEn || '';
  const postPrice = Number(postDetected.price) || 0;
  const postCategory = (postDetected.category || '').toLowerCase();
  const postColors = (postDetected.colors || []).map((c) => c.name.toLowerCase());

  const postTokens = [
    ...tokenize(postTitleBn),
    ...tokenize(postTitleEn),
    ...tokenize(postCaption.slice(0, 200)),
  ];

  let bestMatchProduct: Product | null = null;
  let highestScore = 0;
  let bestReasons: string[] = [];

  for (const prod of existingProducts) {
    let score = 0;
    const matchReasons: string[] = [];

    // 1. IMAGE SIMILARITY (Exact or identical filename/URL)
    if (postImage && prod.image) {
      if (postImage === prod.image) {
        score += 45;
        matchReasons.push('একই ইমেজ / হুবহু ছবির লিংক ম্যাচ হয়েছে (Exact Image Match)');
      } else {
        // Compare image filename or unsplash id
        const postImgFile = postImage.split('?')[0].split('/').pop() || '';
        const prodImgFile = prod.image.split('?')[0].split('/').pop() || '';
        if (postImgFile && prodImgFile && postImgFile === prodImgFile) {
          score += 40;
          matchReasons.push('ছবির ফাইলনেম মিলে গেছে (Identical Image Filename)');
        }
      }
    }

    // 2. NAME / TITLE SIMILARITY (Bengali & English)
    const prodTokens = [
      ...tokenize(prod.titleBn),
      ...tokenize(prod.titleEn),
    ];

    const titleSim = Math.max(
      tokenSimilarity(tokenize(postTitleBn), tokenize(prod.titleBn)),
      tokenSimilarity(tokenize(postTitleEn), tokenize(prod.titleEn)),
      tokenSimilarity(postTokens, prodTokens)
    );

    const subSimBn = substringOverlap(postTitleBn, prod.titleBn);
    const subSimEn = substringOverlap(postTitleEn, prod.titleEn);
    const maxSubSim = Math.max(subSimBn, subSimEn);

    if (maxSubSim === 1.0) {
      score += 45;
      matchReasons.push(`হুবহু প্রোডাক্টের নাম মিলেছে: "${prod.titleBn || prod.titleEn}" (Exact Title Match)`);
    } else if (titleSim >= 0.75 || maxSubSim >= 0.8) {
      score += 35;
      matchReasons.push(`নামের মধ্যে উচ্চ মিল রয়েছে (${Math.round(titleSim * 100)}% Title Similarity)`);
    } else if (titleSim >= 0.45) {
      score += 20;
      matchReasons.push(`নামের কিছু মূল শব্দ মিলেছে (${Math.round(titleSim * 100)}% Token Match)`);
    }

    // Check if FB caption explicitly contains the exact product title
    const normCaption = normalizeText(postCaption);
    if (prod.titleBn && normCaption.includes(normalizeText(prod.titleBn)) && normalizeText(prod.titleBn).length > 5) {
      score += 25;
      matchReasons.push(`ক্যাপশনে হুবহু বিদ্যমান পণ্যের নাম উল্লেখ আছে`);
    } else if (prod.titleEn && normCaption.includes(normalizeText(prod.titleEn)) && normalizeText(prod.titleEn).length > 5) {
      score += 25;
      matchReasons.push(`ক্যাপশনে হুবহু বিদ্যমান পণ্যের নাম উল্লেখ আছে`);
    }

    // 3. PRICE SIMILARITY
    const prodPrice = Number(prod.price) || 0;
    if (postPrice > 0 && prodPrice > 0) {
      if (postPrice === prodPrice) {
        score += 20;
        matchReasons.push(`মূল্য পুরোপুরি এক: ৳${postPrice.toLocaleString('bn-BD')} (Exact Price Match)`);
      } else {
        const diffPercent = Math.abs(postPrice - prodPrice) / prodPrice;
        if (diffPercent <= 0.05) {
          score += 12;
          matchReasons.push(`মূল্যের পার্থক্য ৫% এর কম (পোস্ট: ৳${postPrice}, বিদ্যমান: ৳${prodPrice})`);
        }
      }
    }

    // 4. CATEGORY SIMILARITY
    const prodCat = (prod.category || prod.categoryId || '').toLowerCase();
    if (postCategory && prodCat && postCategory === prodCat) {
      score += 10;
      matchReasons.push(`ক্যাটাগরি একই: ${prod.category} (Same Category)`);
    }

    // 5. COLOR SIMILARITY
    if (prod.colors && Array.isArray(prod.colors) && postColors.length > 0) {
      const prodColorNames = prod.colors.map((c) => c.name.toLowerCase());
      const commonColors = postColors.filter((c) => prodColorNames.some((pc) => pc.includes(c) || c.includes(pc)));
      if (commonColors.length > 0) {
        score += 10;
        matchReasons.push(`রং মিলেছে: ${commonColors.join(', ')} (Matching Colors)`);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatchProduct = prod;
      bestReasons = matchReasons;
    }
  }

  // Normalize final score to max 100
  const finalScore = Math.min(100, Math.round(highestScore));

  // Determine Level:
  // 🔴 ALREADY EXISTS: >= 65 score OR (strong title match and category) OR exact image match
  // 🟡 POSSIBLE MATCH: >= 30 and < 65 score
  // 🟢 NEW PRODUCT: < 30 score
  let level: DuplicateMatchLevel = 'new_product';

  if (finalScore >= 65) {
    level = 'already_exists';
  } else if (finalScore >= 30) {
    level = 'possible_match';
  } else {
    level = 'new_product';
    if (bestReasons.length === 0) {
      bestReasons.push('বিদ্যমান কোনো পণ্যের সাথে সাদৃশ্য পাওয়া যায়নি (No matching products found)');
    }
  }

  return {
    level,
    score: finalScore,
    reasons: bestReasons,
    matchedProductId: bestMatchProduct?.id,
    matchedProductTitle: bestMatchProduct?.titleEn,
    matchedProductTitleBn: bestMatchProduct?.titleBn,
    matchedProductImage: bestMatchProduct?.image,
    matchedProductPrice: bestMatchProduct?.price,
    matchedProductCategory: bestMatchProduct?.category,
  };
}
