async function testResolutions() {
  const tests = [
    "https://videos.pexels.com/video-files/11035010/11035010-hd_1920_1080_24fps.mp4",
    "https://videos.pexels.com/video-files/11035010/11035010-sd_640_360_24fps.mp4",
    "https://videos.pexels.com/video-files/8750554/8750554-hd_1920_1080_24fps.mp4",
    "https://videos.pexels.com/video-files/8750554/8750554-sd_640_360_24fps.mp4",
    "https://videos.pexels.com/video-files/35067978/14854576_1280_720_50fps.mp4",
    "https://videos.pexels.com/video-files/35067978/14854576_640_360_50fps.mp4"
  ];
  for (const url of tests) {
    const res = await fetch(url, { method: "HEAD" });
    console.log(`${url.split('/').pop()} -> Status: ${res.status}, Size: ${res.headers.get("content-length")}`);
  }
}
testResolutions().catch(console.error);
