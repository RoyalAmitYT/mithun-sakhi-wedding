async function check() {
  const url = "https://www.pexels.com/search/indian%20wedding/";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Length:", text.length);
  // Look for photo IDs or image links
  const imgMatches = text.match(/images\.pexels\.com\/photos\/([0-9]+)\//g);
  console.log("imgMatches:", imgMatches ? imgMatches.slice(0, 10) : null);
}
check();
