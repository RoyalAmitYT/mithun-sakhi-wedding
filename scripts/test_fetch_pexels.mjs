async function test() {
  const url = "https://images.pexels.com/photos/29497914/pexels-photo-29497914.jpeg?auto=compress&cs=tinysrgb&w=1280";
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  console.log("Status:", res.status);
  console.log("Content-Type:", res.headers.get("content-type"));
  console.log("Content-Length:", res.headers.get("content-length"));
}
test().catch(console.error);
