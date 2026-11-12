async function testVids() {
  const ids = ["11035010", "35067978", "8750554"];
  for (const id of ids) {
    const url = `https://www.pexels.com/download/video/${id}/`;
    const res = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      redirect: "follow"
    });
    console.log(`Video ${id} -> Status: ${res.status}, Type: ${res.headers.get("content-type")}, Size: ${res.headers.get("content-length")}, URL: ${res.url}`);
  }
}
testVids().catch(console.error);
