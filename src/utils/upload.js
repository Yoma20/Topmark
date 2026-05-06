const upload = async (file) => {
  const data = new FormData();
  data.append("image", file);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
    { method: "POST", body: data }
  );

  const json = await res.json();
  return json.data.url;
};

export default upload;